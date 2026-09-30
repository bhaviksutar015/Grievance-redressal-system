#!/usr/bin/env bash
# ============================================================================
# OGRSA backend end-to-end test script
# Creates two citizens + one admin via Neon Auth, then exercises the API,
# including the CRITICAL IDOR/ownership test.
# Usage: bash server/test/api.test.sh
# ============================================================================
set -u
API="http://localhost:4000/api"
BASE=$(grep NEON_AUTH_BASE_URL /home/user/.env.local | cut -d= -f2- | tr -d '"')
PASS=0; FAIL=0
STAMP=$(date +%s)

check () { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); echo "  ✔ $1 (=$3)";
  else FAIL=$((FAIL+1)); echo "  ✘ $1 (expected $2, got $3)"; fi
}

get_token () { # get_token <email> <password> <name> -> prints JWT
  local cj="/tmp/cj-$1.txt"
  curl -s -X POST "$BASE/sign-up/email" -H 'Content-Type: application/json' \
    -H "Origin: http://localhost:5173" -c "$cj" \
    -d "{\"email\":\"$1\",\"password\":\"$2\",\"name\":\"$3\"}" > /dev/null
  # sign-in (works whether or not sign-up just succeeded)
  curl -s -X POST "$BASE/sign-in/email" -H 'Content-Type: application/json' \
    -H "Origin: http://localhost:5173" -c "$cj" \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" > /dev/null
  curl -s "$BASE/token" -b "$cj" -H "Origin: http://localhost:5173" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).token)}catch{console.log('')}})"
}

echo "== 0. Health & public endpoints =="
check "GET /health"        200 "$(curl -s -o /dev/null -w '%{http_code}' $API/health)"
check "GET /stats/public"  200 "$(curl -s -o /dev/null -w '%{http_code}' $API/stats/public)"
check "GET /categories"    200 "$(curl -s -o /dev/null -w '%{http_code}' $API/categories)"
check "GET /awareness"     200 "$(curl -s -o /dev/null -w '%{http_code}' $API/awareness)"
NCAT=$(curl -s $API/categories | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).data.length))")
check "categories seeded (10)" 10 "$NCAT"

echo "== 1. Auth (via Neon Auth) =="
TOK_A=$(get_token "citizen-a-$STAMP@example.com" "TestPass#123" "Asha Citizen")
TOK_B=$(get_token "citizen-b-$STAMP@example.com" "TestPass#123" "Bilal Citizen")
TOK_ADMIN=$(get_token "admin-$STAMP@example.com" "AdminPass#123" "Admin Officer")
[ -n "$TOK_A" ] && echo "  ✔ Citizen A token obtained" || echo "  ✘ Citizen A token FAILED"
[ -n "$TOK_B" ] && echo "  ✔ Citizen B token obtained" || echo "  ✘ Citizen B token FAILED"

check "GET /auth/me without token" 401 "$(curl -s -o /dev/null -w '%{http_code}' $API/auth/me)"
check "GET /auth/me bad token"     401 "$(curl -s -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer garbage' $API/auth/me)"
check "GET /auth/me Citizen A"     200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_A" $API/auth/me)"
check "GET /auth/me Citizen B"     200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_B" $API/auth/me)"
check "GET /auth/me Admin(acct)"   200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_ADMIN" $API/auth/me)"

echo "== 2. Promote admin via trusted script =="
cd /home/user && node server/src/db/make-admin.js "admin-$STAMP@example.com" 2>&1 | grep -q "is now an ADMIN" && echo "  ✔ make-admin script" || echo "  ✘ make-admin script"

echo "== 3. Grievance creation (Citizen A, with attachment) =="
CAT_ID=$(curl -s $API/categories | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).data.find(c=>c.name==='Water Supply').id))")
# create a small png
node -e "require('fs').writeFileSync('/tmp/evidence.png', Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000 1f15c4890000000d49444154789c626001000000ffff030000060005 57bfabd40000000049454e44ae426082'.replace(/ /g,''),'hex'))"
CREATE=$(curl -s -X POST "$API/grievances" -H "Authorization: Bearer $TOK_A" \
  -F "categoryId=$CAT_ID" -F "subject=No water supply in Ward 12 for five days" \
  -F "description=Our locality in Ward 12, Andheri East has had no municipal water supply for the last five days. Tankers are irregular and residents are struggling." \
  -F "location=Ward 12, Andheri East, Mumbai" -F "department=Water Works Department" \
  -F "priority=HIGH" -F "attachments=@/tmp/evidence.png;type=image/png")
G_ID=$(echo "$CREATE" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.data?.id||'')})")
G_REF=$(echo "$CREATE" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.data?.referenceId||'')})")
[ -n "$G_ID" ] && echo "  ✔ grievance created: $G_REF" || { echo "  ✘ creation failed: $CREATE"; }
echo "$G_REF" | grep -qE '^OGRSA-[0-9]{4}-[0-9]{6}$' && echo "  ✔ reference format OK" || echo "  ✘ bad reference format"

echo "-- validation --"
check "reject short subject" 400 "$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/grievances -H "Authorization: Bearer $TOK_A" -F "categoryId=$CAT_ID" -F "subject=abc" -F "description=This description is definitely long enough to pass validation checks.")"
check "reject bad category"  400 "$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/grievances -H "Authorization: Bearer $TOK_A" -F "categoryId=not-a-uuid" -F "subject=Valid subject here" -F "description=This description is definitely long enough to pass validation checks.")"
check "reject exe upload"    400 "$(echo 'x' > /tmp/mal.exe; curl -s -o /dev/null -w '%{http_code}' -X POST $API/grievances -H "Authorization: Bearer $TOK_A" -F "categoryId=$CAT_ID" -F "subject=Valid subject here" -F "description=This description is definitely long enough to pass validation checks." -F "attachments=@/tmp/mal.exe;type=application/x-msdownload")"

echo "== 4. CRITICAL IDOR TEST: Citizen B accesses Citizen A's grievance =="
IDOR=$(curl -s -o /tmp/idor.json -w '%{http_code}' -H "Authorization: Bearer $TOK_B" $API/grievances/$G_ID)
check "Citizen B -> A's grievance blocked" 404 "$IDOR"
grep -qi "asha\|water\|ward" /tmp/idor.json && echo "  ✘ PRIVATE DATA LEAKED" || echo "  ✔ no private data in response"
check "owner access still works" 200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_A" $API/grievances/$G_ID)"

echo "== 5. Public tracking =="
check "track valid ref"   200 "$(curl -s -o /tmp/track.json -w '%{http_code}' $API/grievances/track/$G_REF)"
check "track unknown ref" 404 "$(curl -s -o /dev/null -w '%{http_code}' $API/grievances/track/OGRSA-2026-999999)"
check "track bad format"  400 "$(curl -s -o /dev/null -w '%{http_code}' $API/grievances/track/hello)"
grep -qi "asha\|email\|mobile\|description" /tmp/track.json && echo "  ✘ tracking leaks private fields" || echo "  ✔ tracking exposes safe fields only"

echo "== 6. Citizen listing/stats/search =="
check "GET /grievances/my" 200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_A" "$API/grievances/my?search=water&status=SUBMITTED")"
check "GET /grievances/stats/me" 200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_A" $API/grievances/stats/me)"
NB=$(curl -s -H "Authorization: Bearer $TOK_B" "$API/grievances/my" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).data.pagination.total))")
check "Citizen B sees 0 grievances" 0 "$NB"

echo "== 7. Admin authorization =="
check "citizen blocked from admin list" 403 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_A" $API/admin/grievances)"
check "citizen blocked from admin dash" 403 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_A" $API/admin/dashboard)"
check "admin can list all"  200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_ADMIN" "$API/admin/grievances?priority=HIGH&search=water")"
check "admin detail w/ citizen info" 200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_ADMIN" $API/admin/grievances/$G_ID)"
check "admin dashboard"     200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_ADMIN" $API/admin/dashboard)"

echo "== 8. Status workflow (transactional history + notifications) =="
check "SUBMITTED->UNDER_REVIEW" 200 "$(curl -s -o /dev/null -w '%{http_code}' -X PUT $API/admin/grievances/$G_ID/status -H "Authorization: Bearer $TOK_ADMIN" -H 'Content-Type: application/json' -d '{"status":"UNDER_REVIEW","remark":"Verifying details with the ward office"}')"
check "invalid jump UNDER_REVIEW->RESOLVED" 400 "$(curl -s -o /dev/null -w '%{http_code}' -X PUT $API/admin/grievances/$G_ID/status -H "Authorization: Bearer $TOK_ADMIN" -H 'Content-Type: application/json' -d '{"status":"RESOLVED"}')"
check "UNDER_REVIEW->IN_PROGRESS" 200 "$(curl -s -o /dev/null -w '%{http_code}' -X PUT $API/admin/grievances/$G_ID/status -H "Authorization: Bearer $TOK_ADMIN" -H 'Content-Type: application/json' -d '{"status":"IN_PROGRESS","remark":"Repair crew dispatched","department":"Water Works Department"}')"
check "admin remark" 201 "$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/admin/grievances/$G_ID/remarks -H "Authorization: Bearer $TOK_ADMIN" -H 'Content-Type: application/json' -d '{"remark":"Your complaint has been forwarded to the concerned department."}')"
check "citizen blocked from status change" 403 "$(curl -s -o /dev/null -w '%{http_code}' -X PUT $API/admin/grievances/$G_ID/status -H "Authorization: Bearer $TOK_A" -H 'Content-Type: application/json' -d '{"status":"RESOLVED"}')"
check "feedback before resolution rejected" 409 "$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/grievances/$G_ID/feedback -H "Authorization: Bearer $TOK_A" -H 'Content-Type: application/json' -d '{"rating":5}')"
check "IN_PROGRESS->RESOLVED" 200 "$(curl -s -o /dev/null -w '%{http_code}' -X PUT $API/admin/grievances/$G_ID/status -H "Authorization: Bearer $TOK_ADMIN" -H 'Content-Type: application/json' -d '{"status":"RESOLVED","remark":"Water supply restored after main line repair"}')"

echo "== 9. History & notifications =="
NHIST=$(curl -s -H "Authorization: Bearer $TOK_A" $API/grievances/$G_ID | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).data.history.length))")
[ "$NHIST" -ge 4 ] && echo "  ✔ status history has $NHIST entries" || echo "  ✘ history entries: $NHIST"
NOTIF=$(curl -s -H "Authorization: Bearer $TOK_A" $API/notifications | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.data.items.length+':'+j.data.unread)})")
echo "  notifications(count:unread) = $NOTIF"
NID=$(curl -s -H "Authorization: Bearer $TOK_A" $API/notifications | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).data.items[0].id))")
check "mark notification read" 200 "$(curl -s -o /dev/null -w '%{http_code}' -X PUT $API/notifications/$NID/read -H "Authorization: Bearer $TOK_A")"
check "B cannot read A's notification" 404 "$(curl -s -o /dev/null -w '%{http_code}' -X PUT $API/notifications/$NID/read -H "Authorization: Bearer $TOK_B")"

echo "== 10. Feedback =="
check "owner feedback after resolve" 201 "$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/grievances/$G_ID/feedback -H "Authorization: Bearer $TOK_A" -H 'Content-Type: application/json' -d '{"rating":4,"comment":"Resolved but took some time."}')"
check "duplicate feedback blocked" 409 "$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/grievances/$G_ID/feedback -H "Authorization: Bearer $TOK_A" -H 'Content-Type: application/json' -d '{"rating":5}')"
check "B cannot feedback A's grievance" 404 "$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/grievances/$G_ID/feedback -H "Authorization: Bearer $TOK_B" -H 'Content-Type: application/json' -d '{"rating":1}')"
check "admin feedback stats" 200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_ADMIN" $API/admin/feedback)"

echo "== 11. Profile =="
check "GET /profile" 200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_A" $API/profile)"
check "PUT /profile" 200 "$(curl -s -o /dev/null -w '%{http_code}' -X PUT $API/profile -H "Authorization: Bearer $TOK_A" -H 'Content-Type: application/json' -d '{"name":"Asha P. Citizen","mobile":"+91 9876543210"}')"
ROLE=$(curl -s -X PUT $API/profile -H "Authorization: Bearer $TOK_A" -H 'Content-Type: application/json' -d '{"name":"Hacker","mobile":"9876543210","role":"ADMIN"}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).data.role))")
check "role escalation blocked (stays CITIZEN)" CITIZEN "$ROLE"

echo "== 12. Categories & awareness (admin) =="
check "citizen cannot create category" 403 "$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/categories -H "Authorization: Bearer $TOK_A" -H 'Content-Type: application/json' -d '{"name":"Hack"}')"
check "admin create category" 201 "$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/categories -H "Authorization: Bearer $TOK_ADMIN" -H 'Content-Type: application/json' -d "{\"name\":\"Test Cat $STAMP\",\"description\":\"temp\"}")"
check "duplicate category blocked" 409 "$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/categories -H "Authorization: Bearer $TOK_ADMIN" -H 'Content-Type: application/json' -d "{\"name\":\"Test Cat $STAMP\"}")"
check "admin awareness create" 201 "$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/awareness -H "Authorization: Bearer $TOK_ADMIN" -H 'Content-Type: application/json' -d '{"section":"TIP","title":"Temp tip for testing","body":"This is a temporary tip created by the automated test run.","displayOrder":99}')"

echo "== 13. Attachments & export =="
ATT_ID=$(curl -s -H "Authorization: Bearer $TOK_A" $API/grievances/$G_ID | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.data.attachments[0]?.id||'')})")
check "owner downloads attachment" 200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_A" $API/attachments/$ATT_ID)"
check "B cannot download A's attachment" 404 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_B" $API/attachments/$ATT_ID)"
check "admin can download" 200 "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOK_ADMIN" $API/attachments/$ATT_ID)"
CSV=$(curl -s -H "Authorization: Bearer $TOK_ADMIN" $API/admin/export | head -1)
echo "$CSV" | grep -q "Reference ID" && echo "  ✔ CSV export header OK" || echo "  ✘ CSV export broken"
curl -s -H "Authorization: Bearer $TOK_ADMIN" $API/admin/export | grep -qi "email\|mobile\|asha" && echo "  ✘ CSV leaks private data" || echo "  ✔ CSV contains no private citizen data"

echo ""
echo "=================================="
echo "RESULT: $PASS passed, $FAIL failed"
echo "=================================="
[ "$FAIL" = "0" ]

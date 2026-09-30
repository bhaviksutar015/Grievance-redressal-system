/**
 * OGRSA development seed script.
 *  - Inserts the 10 standard grievance categories (idempotent)
 *  - Inserts awareness tips & FAQs (idempotent)
 *
 * It does NOT create authentication accounts. Accounts are created through
 * Neon Auth (sign-up). To grant admin rights to an existing account use:
 *    npm run db:make-admin -- admin@example.com
 */
import { eq } from "drizzle-orm";
import { db, pool, schema } from "./client.js";

const CATEGORIES = [
  ["Education", "Schools, colleges, scholarships, admissions and educational services"],
  ["Healthcare", "Hospitals, clinics, public health services and medical facilities"],
  ["Municipal Services", "Waste collection, sanitation, street lighting and civic amenities"],
  ["Roads & Transport", "Road conditions, potholes, public transport and traffic issues"],
  ["Water Supply", "Drinking water availability, quality, leakage and billing"],
  ["Electricity", "Power outages, faulty meters, billing and street electrification"],
  ["Public Safety", "Safety hazards, encroachments and emergency service issues"],
  ["Environment", "Pollution, tree cutting, waste dumping and environmental hazards"],
  ["Government Services", "Certificates, documents, pensions and administrative services"],
  ["Other", "Grievances that do not fit other categories"],
];

const TIPS = [
  ["TIP", "Be specific and factual", "Describe what happened, where and when. Attach a photo or document as evidence whenever possible. Specific complaints are resolved much faster than vague ones.", 1],
  ["TIP", "Keep your reference ID safe", "Every grievance receives a unique reference ID (e.g. OGRSA-2026-000001). Note it down — it lets you track progress without logging in.", 2],
  ["TIP", "One issue per grievance", "Submit separate grievances for separate problems. Mixing several issues in one complaint delays action on all of them.", 3],
  ["TIP", "Choose the right category", "Selecting the correct category and department routes your grievance to the right authority quickly.", 4],
];

const FAQS = [
  ["FAQ", "Is this an official government portal?", "No. OGRSA is an educational Community Engagement Project (CEP) built by a BSc IT student to spread awareness about how online grievance redressal systems work. It is not affiliated with or integrated into any government portal.", 10],
  ["FAQ", "Do I need an account to track a grievance?", "No. Tracking only needs the public reference ID. Submitting a grievance, viewing full details, remarks and notifications requires a free account.", 11],
  ["FAQ", "What happens after I submit a grievance?", "It moves through a transparent workflow: Submitted → Under Review → Assigned → In Progress → Resolved. You receive an in-app notification at every status change.", 12],
  ["FAQ", "Can I edit my grievance after submission?", "You can add additional information while it is open. The original description is preserved for transparency. Closed (resolved/rejected) grievances cannot be edited.", 13],
  ["FAQ", "What files can I attach?", "PDF, JPG, JPEG or PNG files up to 5 MB each (max 3 files). Executable files are not allowed for security reasons.", 14],
  ["FAQ", "Who can see my personal details?", "Only administrators handling your grievance. Public tracking shows only the subject, category, status and timeline — never your contact information.", 15],
];

async function seed() {
  console.log("Seeding categories…");
  for (const [name, description] of CATEGORIES) {
    const [existing] = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.name, name))
      .limit(1);
    if (!existing) {
      await db.insert(schema.categories).values({ name, description });
      console.log(`  + ${name}`);
    } else {
      console.log(`  = ${name} (exists)`);
    }
  }

  console.log("Seeding awareness content…");
  for (const [section, title, body, displayOrder] of [...TIPS, ...FAQS]) {
    const [existing] = await db
      .select({ id: schema.awarenessContent.id })
      .from(schema.awarenessContent)
      .where(eq(schema.awarenessContent.title, title))
      .limit(1);
    if (!existing) {
      await db
        .insert(schema.awarenessContent)
        .values({ section, title, body, displayOrder });
      console.log(`  + [${section}] ${title}`);
    } else {
      console.log(`  = [${section}] ${title} (exists)`);
    }
  }

  console.log("Seed complete.");
  await pool.end();
}

seed().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});

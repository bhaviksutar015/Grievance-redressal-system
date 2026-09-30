/** Minimal safe CSV serializer (quotes, escapes, formula-injection guard). */
export function toCsv(rows, columns) {
  const escape = (v) => {
    let s = v === null || v === undefined ? "" : String(v);
    // Prevent CSV formula injection in spreadsheet apps
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = columns.map(([label]) => escape(label)).join(",");
  const lines = rows.map((row) =>
    columns
      .map(([, accessor]) =>
        escape(typeof accessor === "function" ? accessor(row) : row[accessor])
      )
      .join(",")
  );
  return [header, ...lines].join("\r\n");
}

import { getLangColor } from "../utils/colors";

export function LangHeatmap({ years, topLangs }) {
  if (!years.length || !topLangs.length) return null;

  const globalMax = Math.max(
    ...years.flatMap(({ langs }) => topLangs.map((l) => langs[l] || 0)),
    1,
  );

  return (
    <div className="heatmap-wrap">
      <table className="heatmap">
        <thead>
          <tr>
            <th className="heatmap-year-col">YEAR</th>
            {topLangs.map((lang) => (
              <th key={lang} style={{ color: getLangColor(lang) }}>
                {lang}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map(({ year, langs }) => (
            <tr key={year}>
              <td className="heatmap-year">{year}</td>
              {topLangs.map((lang) => {
                const val = langs[lang] || 0;
                const color = getLangColor(lang);
                const alpha = val ? Math.max(0.35, val / globalMax) : 0;
                const hexAlpha = Math.round(alpha * 255)
                  .toString(16)
                  .padStart(2, "0");
                return (
                  <td key={lang}>
                    <div
                      className="heatmap-cell"
                      style={{
                        background: val ? `${color}${hexAlpha}` : "transparent",
                        color: val ? "#ffffff" : "var(--muted)",
                      }}
                    >
                      {val > 0 ? val : "·"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

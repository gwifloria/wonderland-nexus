type Lang = "zh" | "en";

interface LanguageToggleProps {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

export function LanguageToggle({ lang, onChange }: LanguageToggleProps) {
  const languages = [
    { value: "zh" as const, label: "中文" },
    { value: "en" as const, label: "EN" },
  ];

  return (
    <div className="flex justify-center gap-3 mb-4">
      <div
        role="radiogroup"
        aria-label="Language"
        className="inline-flex rounded-lg bg-neutral-100 p-1"
      >
        {languages.map(({ value, label }) => {
          const isActive = lang === value;
          return (
            <button
              key={value}
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(value)}
              className={[
                "px-3 py-1.5 rounded-md text-sm focus:outline-none focus-visible:ring-2 transition-colors",
                isActive
                  ? "bg-white shadow text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-200",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

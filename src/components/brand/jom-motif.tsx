export const JOM_MOTIF_NAMES = [
  "arch",
  "menorah",
  "seal",
  "manuscript",
  "masonry",
] as const;

export type JomMotifName = (typeof JOM_MOTIF_NAMES)[number];

type JomMotifProps = {
  name: JomMotifName;
  className?: string;
};

const TITLES: Record<JomMotifName, string> = {
  arch: "Temple-gate arch study",
  menorah: "Seven-branch menorah line study",
  seal: "Circular seal study",
  manuscript: "Hebrew manuscript ruling",
  masonry: "Jerusalem stone course study",
};

export function JomMotif({ name, className = "" }: JomMotifProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      data-motif={name}
      fill="none"
      focusable="false"
      role="presentation"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 100 100"
    >
      <title>{TITLES[name]}</title>
      {name === "arch" ? <ArchStudy /> : null}
      {name === "menorah" ? <MenorahStudy /> : null}
      {name === "seal" ? <SealStudy /> : null}
      {name === "manuscript" ? <ManuscriptStudy /> : null}
      {name === "masonry" ? <MasonryStudy /> : null}
    </svg>
  );
}

function ArchStudy() {
  return (
    <g strokeWidth="1.35">
      <path d="M18 88 V46" />
      <path d="M82 88 V46" />
      <path d="M18 46 C18 22 82 22 82 46" />
      <path d="M26 88 V54" />
      <path d="M74 88 V54" />
      <path d="M26 54 C26 34 74 34 74 54" />
      <path d="M12 88 H88" />
      <path d="M16 92 H84" />
    </g>
  );
}

function MenorahStudy() {
  return (
    <g strokeWidth="1.35">
      <path d="M50 86 V38" />
      <path d="M50 38 C50 24 22 26 22 42" />
      <path d="M50 38 C50 24 78 26 78 42" />
      <path d="M50 46 C50 32 32 34 32 48" />
      <path d="M50 46 C50 32 68 34 68 48" />
      <path d="M50 52 C50 42 40 43 40 54" />
      <path d="M50 52 C50 42 60 43 60 54" />
      <path d="M22 42 V40" />
      <path d="M32 48 V46" />
      <path d="M40 54 V52" />
      <path d="M50 38 V36" />
      <path d="M60 54 V52" />
      <path d="M68 48 V46" />
      <path d="M78 42 V40" />
      <path d="M38 86 H62" />
      <path d="M42 90 H58" />
    </g>
  );
}

function SealStudy() {
  return (
    <g strokeWidth="1.25">
      <circle cx="50" cy="50" r="36" />
      <circle cx="50" cy="50" r="29" />
      <path d="M40 66 V48" />
      <path d="M60 66 V48" />
      <path d="M40 48 C40 36 60 36 60 48" />
      <path d="M36 66 H64" />
      <path d="M32 38 C40 32 60 32 68 38" />
      <path d="M32 62 C40 68 60 68 68 62" />
    </g>
  );
}

function ManuscriptStudy() {
  return (
    <g strokeWidth="1.3">
      <path d="M12 22 H58" />
      <path d="M12 34 H52" />
      <path d="M12 46 H56" />
      <path d="M12 58 H48" />
      <path d="M12 70 H54" />
      <path d="M18 22 V70" />
      <path d="M78 30 L54 78" />
      <path d="M50 34 L68 52" />
      <path d="M64 58 L86 76" />
    </g>
  );
}

function MasonryStudy() {
  return (
    <g strokeWidth="1.2">
      <path d="M10 22 H90" />
      <path d="M10 40 H90" />
      <path d="M10 58 H90" />
      <path d="M10 76 H90" />
      <path d="M10 22 V76" />
      <path d="M90 22 V76" />
      <path d="M34 22 V40" />
      <path d="M62 22 V40" />
      <path d="M22 40 V58" />
      <path d="M50 40 V58" />
      <path d="M78 40 V58" />
      <path d="M38 58 V76" />
      <path d="M66 58 V76" />
    </g>
  );
}

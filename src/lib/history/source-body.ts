export const SOURCE_BODY_CONVERSION_VERSION = "paragraphs-v1";

export type PortableTextSpan = {
  _key: string;
  _type: "span";
  marks: string[];
  text: string;
};

export type PortableTextBlock = {
  _key: string;
  _type: "block";
  style: string;
  markDefs: {
    _key: string;
    _type: string;
    href?: string;
  }[];
  children: PortableTextSpan[];
};

export type SourceBodyConversion = {
  blocks: PortableTextBlock[];
  separators: string[];
  version: typeof SOURCE_BODY_CONVERSION_VERSION;
};

function stableKey(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `k${(hash >>> 0).toString(36)}`;
}

function splitWithSeparators(source: string) {
  const paragraphs: string[] = [];
  const separators: string[] = [];
  const boundary = /\r?\n[ \t]*\r?\n(?:[ \t]*\r?\n)*/g;
  let start = 0;

  for (const match of source.matchAll(boundary)) {
    const index = match.index;
    if (index === undefined) continue;
    const nextStart = index + match[0].length;

    // Keep leading or trailing whitespace attached to source text instead of
    // creating empty Portable Text blocks that Sanity may normalize away.
    if (index === 0 || nextStart === source.length) continue;

    paragraphs.push(source.slice(start, index));
    separators.push(match[0]);
    start = nextStart;
  }

  paragraphs.push(source.slice(start));
  return { paragraphs, separators };
}

export function convertSourceBody(source: string): SourceBodyConversion {
  if (!source) {
    return {
      blocks: [],
      separators: [],
      version: SOURCE_BODY_CONVERSION_VERSION,
    };
  }

  const { paragraphs, separators } = splitWithSeparators(source);
  const blocks = paragraphs.map<PortableTextBlock>((paragraph, index) => ({
    _key: stableKey(`block:${index}:${paragraph}`),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: stableKey(`span:${index}:${paragraph}`),
        _type: "span",
        marks: [],
        text: paragraph,
      },
    ],
  }));

  return {
    blocks,
    separators,
    version: SOURCE_BODY_CONVERSION_VERSION,
  };
}

export function reconstructSourceBody(
  blocks: PortableTextBlock[],
  separators: string[],
) {
  if (!blocks.length) return "";
  if (separators.length !== blocks.length - 1) {
    throw new Error(
      `Cannot reconstruct source body: ${blocks.length} blocks require ${blocks.length - 1} separators, received ${separators.length}.`,
    );
  }

  return blocks
    .map((block) => block.children.map((child) => child.text).join(""))
    .reduce(
      (source, paragraph, index) =>
        index === 0
          ? paragraph
          : `${source}${separators[index - 1]}${paragraph}`,
      "",
    );
}

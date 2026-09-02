import type {
  PortableTextBlock,
  PortableTextSpan,
} from "@/lib/history/source-body";

function renderSpan(span: PortableTextSpan, block: PortableTextBlock) {
  let content: React.ReactNode = span.text;

  for (const mark of span.marks || []) {
    if (mark === "strong") content = <strong>{content}</strong>;
    else if (mark === "em") content = <em>{content}</em>;
    else if (mark === "code") content = <code>{content}</code>;
    else if (mark === "underline") content = <u>{content}</u>;
    else {
      const definition = block.markDefs?.find((item) => item._key === mark);
      if (
        definition?._type === "link" &&
        definition.href &&
        /^https?:\/\//i.test(definition.href)
      ) {
        content = (
          <a href={definition.href} rel="noreferrer">
            {content}
          </a>
        );
      }
    }
  }

  return (
    <span className="whitespace-pre-wrap" key={span._key}>
      {content}
    </span>
  );
}

export function HistoryBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="history-prose">
      {value.map((block) => {
        const children = block.children?.map((span) => renderSpan(span, block));
        if (block.style === "h2") return <h2 key={block._key}>{children}</h2>;
        if (block.style === "h3") return <h3 key={block._key}>{children}</h3>;
        if (block.style === "blockquote") {
          return <blockquote key={block._key}>{children}</blockquote>;
        }
        return <p key={block._key}>{children}</p>;
      })}
    </div>
  );
}

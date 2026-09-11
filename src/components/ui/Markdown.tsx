import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
        li: ({ children }) => <li className="pl-0.5">{children}</li>,
        h1: ({ children }) => <h3 className="mb-1.5 mt-2 text-base font-bold first:mt-0">{children}</h3>,
        h2: ({ children }) => <h3 className="mb-1.5 mt-2 text-base font-bold first:mt-0">{children}</h3>,
        h3: ({ children }) => <h4 className="mb-1 mt-2 text-sm font-bold first:mt-0">{children}</h4>,
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
            {children}
          </a>
        ),
        code: ({ children }) => <code className="rounded bg-base-300/70 px-1 py-0.5 text-[0.85em]">{children}</code>,
        pre: ({ children }) => <pre className="mb-2 overflow-x-auto rounded-field bg-base-300/70 p-2.5 text-xs last:mb-0">{children}</pre>,
        blockquote: ({ children }) => (
          <blockquote className="mb-2 border-l-2 border-primary/40 pl-3 text-base-content/70 last:mb-0">{children}</blockquote>
        ),
        hr: () => <hr className="my-2 border-base-300" />,
        table: ({ children }) => (
          <div className="mb-2 overflow-x-auto last:mb-0">
            <table className="table table-xs">{children}</table>
          </div>
        )
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

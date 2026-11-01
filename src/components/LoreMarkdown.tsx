import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import { useAllEntities } from "@/hooks/useEntities";
import { moduleFor } from "@/config/modules";

/**
 * Renders a markdown body with Obsidian-style [[wikilinks]]. A link resolves to
 * an existing entity (by name, case-insensitive) and navigates there; unresolved
 * links render as a subtle "missing" style so you know what still needs writing.
 */
export function LoreMarkdown({ body }: { body: string }) {
  const entities = useAllEntities();
  const navigate = useNavigate();

  const byName = useMemo(() => {
    const map = new Map<string, { id: string; slug: string }>();
    for (const e of entities ?? []) map.set(e.name.toLowerCase(), { id: e.id, slug: moduleFor(e.kind).slug });
    return map;
  }, [entities]);

  // Convert [[Name]] -> [Name](wiki:Name) before handing to the markdown parser.
  const prepared = useMemo(
    () => body.replace(/\[\[([^\]]+)\]\]/g, (_m, name: string) => `[${name}](wiki:${encodeURIComponent(name)})`),
    [body],
  );

  if (!body.trim()) {
    return <p className="italic text-parchment-300/40">Nothing written yet.</p>;
  }

  return (
    <div className="prose-lore max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            if (href?.startsWith("wiki:")) {
              const name = decodeURIComponent(href.slice(5));
              const target = byName.get(name.toLowerCase());
              if (target) {
                return (
                  <button
                    className="text-arcane-soft underline underline-offset-2 hover:text-arcane"
                    onClick={() => navigate(`/m/${target.slug}/${target.id}`)}
                  >
                    {children}
                  </button>
                );
              }
              return (
                <span className="text-ember/70 underline decoration-dotted" title="This entry doesn't exist yet">
                  {children}
                </span>
              );
            }
            return (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {prepared}
      </ReactMarkdown>
    </div>
  );
}

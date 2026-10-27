type JsonLdProps = {
  data: Record<string, unknown>;
};

/** Renders structured data as an application/ld+json script block. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

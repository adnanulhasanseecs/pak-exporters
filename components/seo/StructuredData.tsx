/**
 * StructuredData component for injecting JSON-LD into pages.
 *
 * Usage:
 * <StructuredData data={createProductStructuredData(product)} />
 */

type StructuredDataProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function StructuredData({ data }: StructuredDataProps) {
  if (!data) return null;

  const json = Array.isArray(data) ? data : [data];

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}



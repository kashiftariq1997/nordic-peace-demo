import { Container } from "@/components/layout";
import { BowIcon } from "@/icons";
import { formatFreeShippingThreshold } from "@/lib";
import { getShopCurrency } from "@/services";

const STATIC_VALUES = [
  {
    title: "Thoughtful fabrics",
    description: "Silk, linen, brushed cotton and soft knits",
  },
  {
    title: "Packed with care",
    description: "Wrapped by hand, ready to gift",
  },
] as const;

/** Thin values strip under the hero — shipping, fabrics, packing. */
export async function ValuesStrip() {
  // Live threshold in the store's Shopify-returned currency — never a hardcoded "$".
  const shippingValue = {
    title: "Complimentary shipping",
    description: `On every order over ${formatFreeShippingThreshold(await getShopCurrency())}`,
  };
  const values = [shippingValue, ...STATIC_VALUES];

  return (
    <section className="bg-cream border-line border-b">
      <Container className="flex flex-col items-center justify-center gap-6 py-8 sm:flex-row sm:gap-12">
        {values.map((value, index) => (
          <div key={value.title} className="flex items-center gap-6">
            {index > 0 ? <BowIcon className="text-rose hidden h-4 w-4 shrink-0 sm:block" /> : null}
            <div className="text-center sm:text-left">
              <p className="font-heading text-plum text-lg">{value.title}</p>
              <p className="text-plum-soft text-sm">{value.description}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart } from '../../utils/guestCart';
import { cartCountManager } from '../../hooks/useCartCount';
import { getImageUrl } from '../../utils/imageUrl';
import { getPriceDisplay, formatEuro } from '../../utils/priceWithVAT';
import type { Product } from '../../types';

interface ProductTileProps {
  product: Product;
  /** Fechas del buscador, para que la ficha las herede. */
  detailQuery?: string;
  hasDates?: boolean;
  rentalDays?: number;
}

export const ProductTile = ({ product, detailQuery = '', hasDates = false, rentalDays = 0 }: ProductTileProps) => {
  const src = getImageUrl(product.mainImageUrl || (product as any).imageUrl || '');
  const [sinFoto, setSinFoto] = useState(!src);

  const consumible = Boolean((product as any).isConsumable);
  const precioDia = Number(product.pricePerDay) || 0;
  const conIVA = precioDia * 1.21;
  const stock = (product as any).realStock ?? 0;
  const agotado = stock <= 0;

  return (
    <div className="group">
      <Link to={`/productos/${product.slug}${detailQuery}`} className="block">
        {sinFoto ? (
          <div className="flex aspect-square w-full items-center justify-center border border-cream/[0.08] bg-ink-800">
            <span className="text-[11px] uppercase tracking-[0.18em] text-cream/25">Sin fotografía</span>
          </div>
        ) : (
          <div className="aspect-square w-full overflow-hidden bg-panel">
            <img
              src={src}
              alt={product.name}
              loading="lazy"
              onError={() => setSinFoto(true)}
              className="h-full w-full object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.05] md:p-7"
            />
          </div>
        )}

        <div className="mt-5 flex items-baseline justify-between gap-4">
          <h3 className="text-[15px] font-medium leading-snug text-cream">{product.name}</h3>
          <span className="shrink-0 text-[15px] tabular-nums text-cream/60">
            {consumible
              ? formatEuro(Number((product as any).pricePerUnit) || 0)
              : hasDates && rentalDays > 0
                ? formatEuro(conIVA * rentalDays)
                : getPriceDisplay(conIVA, '').main}
            {!consumible && !(hasDates && rentalDays > 0) && <span className="text-[13px]">/día</span>}
          </span>
        </div>

        {consumible && <p className="mt-1 text-[12px] text-cream/40">Venta por unidad · IVA no incluido</p>}

        {!consumible && hasDates && rentalDays > 0 && (
          <p className="mt-1 text-[12px] text-cream/40">
            {rentalDays} {rentalDays === 1 ? 'día' : 'días'} · {getPriceDisplay(conIVA, '/día').main}
          </p>
        )}
      </Link>

      <div className="mt-3 h-9">
        {agotado ? (
          <span className="text-[13px] text-cream/40">Consultar disponibilidad</span>
        ) : (
          <button
            onClick={() => {
              cartCountManager.increment(1);
              guestCart.addItem(product, 1);
              toast.success(`${product.name} añadido al carrito`);
            }}
            className="flex h-9 items-center gap-2 text-[13px] text-cream/55 opacity-0 transition-all hover:text-cream focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ShoppingCart className="h-4 w-4" />
            Añadir al carrito
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductTile;

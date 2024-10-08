import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { Suspense } from "react";
import { cache } from "@/lib/cache"; 

const getProducts = cache(() => {
  return db.product.findMany({ 
    where: { isAvaliableForPurchase: true }, 
    orderBy: { name: "asc" } 
  });
}, ["/products", "getProducts"], { revalidate: 60 * 60 * 24 }); // Chave única e revalidação em 24 horas

export default function ProductsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <Suspense fallback={<SkeletonGrid count={8} />}>
        <ProductList />
      </Suspense>
    </div>
  );
}

async function ProductList() {
  const products = await getProducts();

  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </>
  );
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </>
  );
}

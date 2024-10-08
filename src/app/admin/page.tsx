import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";

async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true},
    _count: true
  })

  return {
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberOfSales: data._count
  }
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(), 
    db.order.aggregate ({ _sum: {pricePaidInCents: true} })
  ])

  return {
    userCount,
    avarageValuePerUser: userCount === 0 ? 0 : (orderData._sum.pricePaidInCents || 0) / userCount / 100 
  }
}

async function getProductData() {
  const [activeCount, inactiveCount] = await Promise.all ([
    db.product.count({where: { isAvaliableForPurchase: true}}),
    db.product.count({where: { isAvaliableForPurchase: false}}),
  ])

  return {
    activeCount,
    inactiveCount
  }
}

export default async function AdminDashboard() {

  const [salesData, userData, productData] = await Promise.all ([
    await getSalesData(),
    await getUserData(),
    await getProductData(), 
  ])
 

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardCard 
      title="Vendas" 
      subtitle={`${formatNumber(salesData.numberOfSales)} Pedidos`}
      body={formatCurrency(salesData.amount)}  
      />
      <DashboardCard 
      title="Clientes" 
      subtitle={`${formatCurrency(userData.avarageValuePerUser)} Valor Médio`}
      body={formatNumber(userData.userCount)}  
      />
      <DashboardCard 
      title="Produtos Ativos" 
      subtitle={`${formatNumber(productData.inactiveCount)} Produtos Inativos`}
      body={formatNumber(productData.activeCount)}  
      />
    </div>
  );
}



type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
}

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}

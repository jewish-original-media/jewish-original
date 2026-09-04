import { HomePageView } from "@/components/home/home-page";
import { getHomePageData } from "@/features/homepage";

export const revalidate = 3600;

export default async function HomePage() {
  const data = await getHomePageData();

  return <HomePageView data={data} />;
}

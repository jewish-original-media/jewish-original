import { HomePageView } from "@/components/home/home-page";
import { getHomePageData } from "@/features/homepage";

export const revalidate = 300;

export default async function HomePage() {
  const data = await getHomePageData();

  return <HomePageView data={data} />;
}

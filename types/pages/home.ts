export interface HomeSearchParams {
  tag?: string;
  q?: string;
  page?: string;
}

export interface HomePageRouteProps {
  searchParams: Promise<HomeSearchParams>;
}

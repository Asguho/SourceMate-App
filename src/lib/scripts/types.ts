export interface Source {
  corporate: boolean;
  url: string;
  webPageName: string;
  webSiteName: string;
  year: string;
  month: string;
  day: string;
  authors: string[];
  otherData: {
    response: {
      ok: boolean;
    };
    url: {
      hostname: string;
    };
    title: string;
    [key: PropertyKey]: unknown;
  };
}

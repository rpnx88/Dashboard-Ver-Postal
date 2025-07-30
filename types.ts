
export enum Category {
    UrbanInfrastructure = "Infraestrutura Urbana",
    EnvironmentAndSanitation = "Meio Ambiente e Saneamento",
    MobilityAndTransit = "Mobilidade e Trânsito",
    PublicServices = "Serviços Públicos",
    PublicSafety = "Segurança Pública",
    CommunitySpaces = "Espaços Comunitários"
}

export interface LegislativeMatter {
  id: string; 
  summary: string;
  category: Category;
  location: {
    address: string;
    neighborhood?: string;
  };
  presentationDate: string;
  author: string;
  status: string;
  protocol: string;
  pdfLink: string;
}

export interface CategoryData {
    name: Category;
    value: number;
}

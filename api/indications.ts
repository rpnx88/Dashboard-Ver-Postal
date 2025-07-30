
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';
import { LegislativeMatter, Category } from '../src/types';

// Helper para categorizar baseado em palavras-chave (uma simplificação do que o Gemini faria)
function getCategoryFromSummary(summary: string): Category {
    const s = summary.toLowerCase();
    if (s.includes('paviment') || s.includes('asfáltica') || s.includes('calçamento') || s.includes('buraco') || s.includes('infraestrutura')) return Category.UrbanInfrastructure;
    if (s.includes('lixo') || s.includes('lixeira') || s.includes('reciclável') || s.includes('limpeza') || s.includes('boca de lobo') || s.includes('poda') || s.includes('vegetação') || s.includes('entulho') || s.includes('drenagem')) return Category.EnvironmentAndSanitation;
    if (s.includes('trânsito') || s.includes('sinalização') || s.includes('faixa de segurança') || s.includes('pedestre') || s.includes('lombada') || s.includes('estacionamento') || s.includes('velocidade')) return Category.MobilityAndTransit;
    if (s.includes('iluminação') || s.includes('lâmpada')) return Category.PublicServices;
    if (s.includes('segurança') || s.includes('procon')) return Category.PublicSafety;
    if (s.includes('praça') || s.includes('parque')) return Category.CommunitySpaces;
    return Category.UrbanInfrastructure;
}

async function scrapeUrl(url: string): Promise<LegislativeMatter[]> {
    const matters: LegislativeMatter[] = [];
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
        });
        
        if (!response.ok) {
            console.error(`Falha ao buscar ${url}: ${response.status} ${response.statusText}`);
            return [];
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        $('table.table tbody tr').each((i, elem) => {
            const columns = $(elem).find('td');
            if (columns.length > 3) {
                const idText = $(columns[0]).find('a').text().trim();
                if (!idText) return; // Pular linhas vazias

                const pdfLink = $(columns[0]).find('a').attr('href') || '';
                const summary = $(columns[1]).text().trim();
                const author = $(columns[2]).text().trim();
                const presentationDate = $(columns[3]).text().trim();
                const protocolMatch = pdfLink.match(/protocolo=(\d+)/);
                const protocol = protocolMatch ? protocolMatch[1] : 'N/A';
                
                const neighborhoodMatch = summary.match(/(?:bairro|no|na)\s+([\w\s-]+)/i);
                const neighborhood = neighborhoodMatch ? neighborhoodMatch[1].replace(/[,.]$/, '').trim() : undefined;
                
                const matter: LegislativeMatter = {
                    id: idText,
                    summary: summary,
                    author: author,
                    presentationDate: presentationDate,
                    category: getCategoryFromSummary(summary),
                    location: {
                        address: summary.split(',')[0], // Extração simples de endereço
                        neighborhood: neighborhood,
                    },
                    status: 'Disponível no SAPL',
                    protocol: protocol,
                    pdfLink: pdfLink.startsWith('http') ? pdfLink : `https://sapl.camarabento.rs.gov.br${pdfLink}`,
                };
                matters.push(matter);
            }
        });
    } catch (error) {
        console.error(`Erro ao fazer scraping de ${url}:`, error);
    }
    return matters;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const urls = [
        'https://sapl.camarabento.rs.gov.br/materia/pesquisar-materia?tipo=8&ementa=&numero=&numeracao__numero_materia=&numero_protocolo=&ano=2025&autoria__autor=400&autoria__primeiro_autor=unknown&autoria__autor__tipo=&autoria__autor__parlamentar_set__filiacao__partido=&o=&tipo_listagem=1&tipo_origem_externa=&numero_origem_externa=&ano_origem_externa=&data_origem_externa_0=&data_origem_externa_1=&local_origem_externa=&data_apresentacao_0=&data_apresentacao_1=&data_publicacao_0=&data_publicacao_1=&relatoria__parlamentar_id=&em_tramitacao=&tramitacao__unidade_tramitacao_destino=&tramitacao__status=&materiaassunto__assunto=&indexacao=&regime_tramitacao=&salvar=Pesquisar',
        'https://sapl.camarabento.rs.gov.br/materia/pesquisar-materia?page=2&tipo=8&ementa=&numero=&numeracao__numero_materia=&numero_protocolo=&ano=2025&autoria__autor=400&autoria__primeiro_autor=unknown&autoria__autor__tipo=&autoria__autor__parlamentar_set__filiacao__partido=&o=&tipo_listagem=1&tipo_origem_externa=&numero_origem_externa=&ano_origem_externa=&data_origem_externa_0=&data_origem_externa_1=&local_origem_externa=&data_apresentacao_0=&data_apresentacao_1=&data_publicacao_0=&data_publicacao_1=&relatoria__parlamentar_id=&em_tramitacao=&tramitacao__unidade_tramitacao_destino=&tramitacao__status=&materiaassunto__assunto=&indexacao=&regime_tramitacao=&salvar=Pesquisar'
    ];

    const allMattersPromises = urls.map(scrapeUrl);
    const results = await Promise.all(allMattersPromises);
    const combinedMatters = results.flat();
    
    if (combinedMatters.length === 0) {
      return res.status(503).json({ message: "Não foi possível extrair dados do portal da câmara. O site pode estar temporariamente indisponível ou bloqueando o acesso." });
    }

    // Remover duplicatas e ordenar
    const uniqueMatters = Array.from(new Map(combinedMatters.map(item => [item.id, item])).values());
     uniqueMatters.sort((a, b) => {
        const [, idPartA] = a.id.split(' ');
        const [numA, yearA] = idPartA.split('/').map(Number);
        const [, idPartB] = b.id.split(' ');
        const [numB, yearB] = idPartB.split('/').map(Number);
        if (yearA !== yearB) return yearB - yearA;
        return numB - numA;
    });

    // Cache por 12 horas para não sobrecarregar o servidor da câmara
    res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=3600');
    res.status(200).json(uniqueMatters);
  } catch (error: any) {
    console.error('Erro fatal na API de indicações:', error);
    res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.', error: error.message });
  }
}

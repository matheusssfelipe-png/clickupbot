// Mapeamento de workspaces, spaces, folders e lists do ClickUp
// Atualizado em: 2026-04-09

const WORKSPACES = {
  trizos: {
    id: '9007019902',
    name: 'TRIZOS CO.',
    spaces: {
      operation: {
        id: '90070400296',
        name: 'OPERATION',
        folders: {
          processos: { id: '901310887425', name: 'PROCESSOS', lists: {
            '20dias': { id: '901316948808', name: '20 dias entrada do cliente' },
            rotina_performance: { id: '901316949129', name: 'Rotina Projeto Performance' },
            rotina_cs: { id: '901316951152', name: 'Rotina Sucesso do Cliente' },
          }},
          vip_secrets: { id: '901314166169', name: 'VIP SECRETS', lists: {
            main: { id: '901321141674', name: 'List' },
          }},
          flame: { id: '90134702670', name: 'FLAME LITORAL', lists: {
            tp: { id: '901308354164', name: 'TP - Flame Litoral' },
          }},
          dra_lu: { id: '90071241829', name: 'DRª LU - CLÍNICA VETERINÁRIA', lists: {
            tp: { id: '900702236080', name: 'TP Drª Lu Vet' },
          }},
          orbita: { id: '90138382219', name: 'ORBITA', lists: {
            main: { id: '901313566507', name: 'List' },
          }},
          croasonho: { id: '90138991619', name: 'CROASONHO', lists: {
            main: { id: '901314399718', name: 'List' },
          }},
          pop_move: { id: '90133972543', name: 'POP MOVE', lists: {
            tp: { id: '901307280022', name: 'TP - POP MOVE' },
          }},
          helbor: { id: '90132559148', name: 'HELBOR STAY MOEMA', lists: {
            tp: { id: '901304675879', name: 'TP - Helbor Stay' },
          }},
          trizos_company: { id: '90071189084', name: 'TRIZOS COMPANY', lists: {
            tp: { id: '900702132781', name: 'TP - Trizos Co.' },
            sm: { id: '900702132902', name: 'SM - Trizos Co.' },
          }},
          official_producs: { id: '901310656340', name: 'OFFICIAL PRODUCS PRO', lists: {
            main: { id: '901316644427', name: 'List' },
          }},
          moonlight: { id: '901317257714', name: 'Moonlight Massage', lists: {
            main: { id: '901325643805', name: 'List' },
          }},
        },
      },
      life_management: {
        id: '90070403394',
        name: 'LIFE MANAGEMENT',
        folders: {
          work: { id: '90071160975', name: 'Work', lists: {
            daily: { id: '900702078756', name: 'task list of each day' },
          }},
          redes_sociais: { id: '901313614667', name: 'Redes Sociais', lists: {
            youtube: { id: '901001774326', name: 'YT - Trizos Co.' },
            linkedin: { id: '901324483771', name: 'linkedin' },
          }},
          study: { id: '90071159204', name: 'Study', lists: {
            english: { id: '900702075152', name: 'English' },
            sales: { id: '900702126150', name: 'Sales' },
            russian: { id: '901304724841', name: 'Russian' },
          }},
          frameworks: { id: '90071158894', name: 'Frameworks', lists: {
            main: { id: '900702074494', name: 'Lista' },
          }},
          courses: { id: '90071158882', name: 'Internal courses', lists: {
            google_ads: { id: '900702074464', name: 'Google Ads' },
          }},
          books: { id: '90130533621', name: 'Books', lists: {} },
          treino: { id: '90132756670', name: 'Rotina de treino', lists: {
            main: { id: '901305031784', name: 'List' },
          }},
        },
      },
      commercial: {
        id: '90070041647',
        name: 'COMERCIAL',
        folders: {},
        lists: {
          prospecting: { id: '900702080227', name: 'Marketing gringo' },
          venda_energia: { id: '901326795227', name: 'Venda de energia' }
        }
      },
      company: {
        id: '90070402876',
        name: 'COMPANY',
        folders: {
          trizos: { id: '90071157555', name: 'Trizos Co.', lists: {
            clientes: { id: '901001721004', name: 'Clientes' },
            atividades: { id: '901305831377', name: 'Atividades' },
          }},
        },
      },
      monera: {
        id: '901312288255',
        name: 'MONERA ENERGIA',
        folders: {
          monera: { id: '901315839634', name: 'Monera Energia', lists: {
            docs: { id: '901323604462', name: 'Documentação' },
          }},
        },
      },
    },
  },
  slaymaker: {
    id: '90131955068',
    name: 'SLAYMAKER MKT',
    spaces: {
      operation: {
        id: '90138243502',
        name: 'OPERATION',
        folders: {
          client_01: { id: '901316268148', name: 'Client 01', lists: {
            strategy: { id: '901324233807', name: 'Strategy & Testing' },
            optimization: { id: '901324233862', name: 'Optimization & Tasks' },
            reporting: { id: '901324233879', name: 'Reporting & Comms' },
          }},
          client_02: { id: '901316268157', name: 'Client 02', lists: {
            main: { id: '901324233824', name: 'List' },
          }},
          client_03: { id: '901316268415', name: 'Client 03', lists: {
            main: { id: '901324234207', name: 'List' },
          }},
        },
      },
      framework: {
        id: '901312702890',
        name: 'FRAMEWORK',
        folders: {
          copywriting: { id: '901316270126', name: 'Copywriting', lists: {
            main: { id: '901324236487', name: 'List' },
          }},
        },
        lists: {
          main: { id: '901324236453', name: 'List' },
        },
      },
    },
  },
  energia: {
    id: '90132844810',
    name: 'Vendas de Energia',
    spaces: {
      playbook: {
        id: '901312288094',
        name: 'PLAYBOOK',
        folders: {
          comercial: { id: '901315636830', name: 'Processo comercial', lists: {
            main: { id: '901323305395', name: 'List' },
          }},
        },
        lists: {
          main: { id: '901323305246', name: 'List' },
        },
      },
    },
  },
  marcello: {
    id: '9014993459',
    name: '@energiacommarcello',
    spaces: {
      marketing: {
        id: '90144414452',
        name: 'Marketing',
        folders: {},
      },
    },
  },
};

// Prioridades do ClickUp
const PRIORITIES = {
  urgente: 1,
  alta: 2,
  normal: 3,
  baixa: 4,
};

const PRIORITY_LABELS = {
  1: '🔴 Urgente',
  2: '🟠 Alta',
  3: '🔵 Normal',
  4: '⚪ Baixa',
};

// Helper: buscar list ID pelo nome (busca fuzzy)
function findListByName(searchName) {
  const search = searchName.toLowerCase().trim();
  const results = [];

  for (const [, workspace] of Object.entries(WORKSPACES)) {
    for (const [, space] of Object.entries(workspace.spaces || {})) {
      // Lists diretas no space
      if (space.lists) {
        for (const [, list] of Object.entries(space.lists)) {
          if (list.name.toLowerCase().includes(search)) {
            results.push({
              listId: list.id,
              listName: list.name,
              spaceName: space.name,
              workspaceName: workspace.name,
              folderName: null,
            });
          }
        }
      }
      // Lists dentro de folders
      if (space.folders) {
        for (const [, folder] of Object.entries(space.folders)) {
          // Match no folder name
          if (folder.name.toLowerCase().includes(search)) {
            const firstList = Object.values(folder.lists || {})[0];
            if (firstList) {
              results.push({
                listId: firstList.id,
                listName: firstList.name,
                spaceName: space.name,
                workspaceName: workspace.name,
                folderName: folder.name,
              });
            }
          }
          // Match no list name dentro do folder
          for (const [, list] of Object.entries(folder.lists || {})) {
            if (list.name.toLowerCase().includes(search)) {
              results.push({
                listId: list.id,
                listName: list.name,
                spaceName: space.name,
                workspaceName: workspace.name,
                folderName: folder.name,
              });
            }
          }
        }
      }
    }
  }

  return results;
}

// Helper: buscar folder/client pelo nome
function findFolderByName(searchName) {
  const search = searchName.toLowerCase().trim();
  const results = [];

  for (const [, workspace] of Object.entries(WORKSPACES)) {
    for (const [, space] of Object.entries(workspace.spaces || {})) {
      if (space.folders) {
        for (const [, folder] of Object.entries(space.folders)) {
          if (folder.name.toLowerCase().includes(search)) {
            results.push({
              folderId: folder.id,
              folderName: folder.name,
              spaceName: space.name,
              workspaceName: workspace.name,
              lists: folder.lists,
            });
          }
        }
      }
    }
  }

  return results;
}

module.exports = {
  WORKSPACES,
  PRIORITIES,
  PRIORITY_LABELS,
  findListByName,
  findFolderByName,
};

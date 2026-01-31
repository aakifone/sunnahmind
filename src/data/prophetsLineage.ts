export interface FamilyNode {
  id: string;
  name: string;
  description: string;
  children?: FamilyNode[];
}

export const prophetsLineage: FamilyNode[] = [
  {
    id: "adam",
    name: "Adam عليه السلام",
    description: "First human and Prophet.",
    children: [
      {
        id: "nuh",
        name: "Nuh عليه السلام",
        description: "Prophet of perseverance and renewal.",
        children: [
          {
            id: "ibrahim",
            name: "Ibrahim عليه السلام",
            description: "Father of Prophets, exemplar of tawhid.",
            children: [
              {
                id: "ismail",
                name: "Isma'il عليه السلام",
                description: "Ancestor of the Prophet Muhammad ﷺ.",
                children: [
                  {
                    id: "muhammad",
                    name: "Muhammad ﷺ",
                    description: "Final Messenger to all of humanity.",
                  },
                ],
              },
              {
                id: "ishaq",
                name: "Ishaq عليه السلام",
                description: "Prophet, son of Ibrahim.",
                children: [
                  {
                    id: "yaqub",
                    name: "Ya'qub عليه السلام",
                    description: "Also known as Israel; father of the tribes.",
                    children: [
                      {
                        id: "yusuf",
                        name: "Yusuf عليه السلام",
                        description: "Prophet of patience and forgiveness.",
                      },
                      {
                        id: "musa",
                        name: "Musa عليه السلام",
                        description: "Messenger to Bani Israel.",
                      },
                      {
                        id: "harun",
                        name: "Harun عليه السلام",
                        description: "Brother and supporter of Musa.",
                      },
                      {
                        id: "isa",
                        name: "Isa عليه السلام",
                        description: "Messenger to Bani Israel, born of Maryam عليها السلام.",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

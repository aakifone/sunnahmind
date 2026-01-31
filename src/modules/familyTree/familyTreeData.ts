export interface FamilyNode {
  id: string;
  name: string;
  title: string;
  parentId?: string;
  notes: string[];
}

export const familyTree: FamilyNode[] = [
  {
    id: "adam",
    name: "Adam",
    title: "First Prophet",
    notes: ["Father of humanity", "Created by Allah"],
  },
  {
    id: "nuh",
    name: "Nuh",
    title: "Prophet",
    parentId: "adam",
    notes: ["Called his people to tawhid", "Ark and the great flood"],
  },
  {
    id: "ibrahim",
    name: "Ibrahim",
    title: "Khalilullah",
    parentId: "nuh",
    notes: ["Model of devotion", "Builder of the Ka'bah"],
  },
  {
    id: "ismail",
    name: "Isma'il",
    title: "Prophet",
    parentId: "ibrahim",
    notes: ["Helped Ibrahim rebuild the Ka'bah"],
  },
  {
    id: "ishaq",
    name: "Ishaq",
    title: "Prophet",
    parentId: "ibrahim",
    notes: ["Father of Ya'qub (Israel)"],
  },
  {
    id: "yaqub",
    name: "Ya'qub",
    title: "Prophet",
    parentId: "ishaq",
    notes: ["Also known as Israel"],
  },
  {
    id: "yusuf",
    name: "Yusuf",
    title: "Prophet",
    parentId: "yaqub",
    notes: ["Known for patience and forgiveness"],
  },
  {
    id: "musa",
    name: "Musa",
    title: "Prophet",
    parentId: "yaqub",
    notes: ["Spoke to Allah", "Delivered the Torah"],
  },
  {
    id: "isa",
    name: "Isa",
    title: "Prophet",
    parentId: "ibrahim",
    notes: ["Born to Maryam", "Signs and compassion"],
  },
  {
    id: "muhammad",
    name: "Muhammad ﷺ",
    title: "Final Messenger",
    parentId: "ismail",
    notes: ["Seal of the Prophets", "Mercy to the worlds"],
  },
];

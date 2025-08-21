import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Package, // Pacotes/Produtos
  FileText, // Relatórios
  Truck, // Fornecedores/Logística
  ClipboardList, // Gerenciamento de Tarefas
  User, // Clientes/Vendedores
  Warehouse, // Estoque
  DollarSign, // Vendas
  TrendingUp, // Progresso
} from "lucide-react";

// Defina a interface para as propriedades do componente
interface WelcomePageProps {
  role: "ADMIN" | "MANAGER" | "VENDEDOR";
  handleVisible: (
    e: React.MouseEvent<HTMLButtonElement>,
    caminho: string
  ) => void;
}

// const getCardsByRole = (role: "ADMIN" | "MANAGER" | "VENDEDOR") => {
//   const allCards = [
//     {
//       icon: <Warehouse className="w-12 h-12 text-white mx-auto mb-4" />,
//       title: "Gerenciar Estoque",
//       description: "Adicione, remova e atualize produtos em seu estoque.",
//       path: "/inventory/stock",
//     },
//     {
//       icon: <Truck className="w-12 h-12 text-white mx-auto mb-4" />,
//       title: "Controle de Fornecedores",
//       description:
//         "Gerencie a entrada e saída de mercadorias com seus fornecedores.",
//       path: "/inventory/suppliers",
//     },
//     {
//       icon: <DollarSign className="w-12 h-12 text-white mx-auto mb-4" />,
//       title: "Relatórios de Vendas",
//       description: "Acompanhe o desempenho de vendas e itens mais vendidos.",
//       path: "/inventory/reports",
//     },
//     {
//       icon: <User className="w-12 h-12 text-white mx-auto mb-4" />,
//       title: "Informações de Clientes",
//       description: "Acesse detalhes de clientes para um serviço personalizado.",
//       path: "/inventory/clients",
//     },
//     {
//       icon: <ClipboardList className="w-12 h-12 text-white mx-auto mb-4" />,
//       title: "Lançamento de Venda",
//       description: "Registre novas vendas de forma rápida e precisa.",
//       path: "/inventory/new-sale",
//     },
//     {
//       icon: <TrendingUp className="w-12 h-12 text-white mx-auto mb-4" />,
//       title: "Análise de Estoque",
//       description: "Visualize gráficos e tendências do seu inventário.",
//       path: "/inventory/analysis",
//     },
//   ];

//   switch (role) {
//     case "ADMIN":
//       return allCards;
//     case "MANAGER":
//       return allCards.filter(
//         (card) =>
//           card.title !== "Lançamento de Venda" &&
//           card.title !== "Informações de Clientes"
//       );
//     case "VENDEDOR":
//       return allCards.filter(
//         (card) =>
//           card.title === "Lançamento de Venda" ||
//           card.title === "Informações de Clientes"
//       );
//     default:
//       return [];
//   }
// };

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const FeatureCard = ({
  icon,
  title,
  description,
  onClick,
}: FeatureCardProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center cursor-pointer border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
    >
      {icon}
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-white/80 text-sm">{description}</p>
    </button>
  );
};

// Componente principal da página de boas-vindas
export function WelcomePage({ role, handleVisible }: WelcomePageProps) {
  const getGreeting = () => {
    switch (role) {
      case "ADMIN":
        return "Gerencie o estoque, vendas e toda a equipe. Você tem controle total.";
      case "MANAGER":
        return "Monitore o inventário e a logística para manter tudo em ordem.";
      case "VENDEDOR":
        return "Lance vendas e acesse informações de clientes rapidamente.";
      default:
        return "Acompanhe todos os seus projetos e o progresso em tempo real.";
    }
  };

  //   const cards = getCardsByRole(role);

  return (
    <div className="w-full min-h-screen bg-gradient-to-tr from-gray-900/90 via-gray-800/90 to-blue-800/80 flex flex-col items-center justify-center px-4 py-16">
      <div className={`text-center mb-12 transition-opacity duration-1000`}>
        <h1 className="font-light text-4xl md:text-5xl text-white mb-6">
          Olá, {role}!
        </h1>
        <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto">
          {getGreeting()}
        </p>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-6xl w-full">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <FeatureCard
              icon={card.icon}
              title={card.title}
              description={card.description}
              onClick={(e) => handleVisible(e, card.path)}
            />
          </motion.div>
        ))}
      </div> */}
    </div>
  );
}

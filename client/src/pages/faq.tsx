
import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import Layout from "@/components/layout";

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "creation" | "trading" | "technical";
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "general" | "creation" | "trading" | "technical">("all");

  const faqData: FAQItem[] = [
    {
      question: "What is CoinIT?",
      answer: "CoinIT is a platform that allows you to transform blog posts and articles into tradeable digital assets (coins) on the blockchain. It bridges traditional web content with Web3 technology.",
      category: "general"
    },
    {
      question: "How do I create a coin?",
      answer: "Simply paste a blog URL into our platform, preview the extracted content, customize the metadata, and mint it as a coin on the Base blockchain. The process is automated and user-friendly.",
      category: "creation"
    },
    {
      question: "What blockchains does CoinIT support?",
      answer: "Currently, CoinIT operates on the Base network, which is an Ethereum Layer 2 built by Coinbase. We chose Base for its low fees, fast transactions, and growing DeFi ecosystem.",
      category: "technical"
    },
    {
      question: "Can I trade coins created by others?",
      answer: "Yes! Once coins are minted, they become tradeable digital assets. You can buy, sell, and trade them on supported marketplaces and within our platform.",
      category: "trading"
    },
    {
      question: "How is the value of a coin determined?",
      answer: "Coin values are determined by market demand, the quality and popularity of the content, creator reputation, and trading activity. It follows standard supply and demand economics.",
      category: "trading"
    },
    {
      question: "Do I need a crypto wallet?",
      answer: "Yes, you'll need a compatible Web3 wallet like MetaMask, WalletConnect, or others to interact with the blockchain, create coins, and make trades.",
      category: "technical"
    },
    {
      question: "What types of content can I monetize?",
      answer: "You can create coins from blog posts, articles, news stories, opinion pieces, tutorials, and any web content that can be scraped. The content should be publicly accessible.",
      category: "creation"
    },
    {
      question: "Are there any fees?",
      answer: "There are standard blockchain transaction fees (gas fees) for minting and trading. We also charge a small platform fee for our services, which helps maintain and improve the platform.",
      category: "general"
    },
    {
      question: "How is content stored?",
      answer: "Content metadata is stored on IPFS (InterPlanetary File System) for decentralized, permanent storage. This ensures your coins and their associated content remain accessible.",
      category: "technical"
    },
    {
      question: "Can I edit a coin after creation?",
      answer: "Once minted on the blockchain, the core coin data cannot be changed. However, you can update certain metadata fields and descriptions through our platform interface.",
      category: "creation"
    }
  ];

  const filteredFAQs = selectedCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const categories = [
    { key: "all", label: "All Questions" },
    { key: "general", label: "General" },
    { key: "creation", label: "Creating Coins" },
    { key: "trading", label: "Trading" },
    { key: "technical", label: "Technical" }
  ] as const;

  return (
    <Layout>
      <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-black mb-4 text-white">
            Frequently Asked <span className="spotify-green">Questions</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about CoinIT and content tokenization.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                selectedCategory === category.key
                  ? "bg-primary text-black"
                  : "bg-muted/20 text-muted-foreground hover:text-white"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((item, index) => (
            <div key={index} className="spotify-card rounded-xl overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/5 transition-colors"
              >
                <h3 className="text-lg font-bold text-white pr-4">{item.question}</h3>
                {openItems.includes(index) ? (
                  <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-6">
                  <div className="border-t border-border pt-4">
                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-muted/20 rounded-full text-xs font-semibold text-primary capitalize">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center bg-muted/10 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Get in touch with our support team.
          </p>
          <button className="spotify-button">
            Contact Support
          </button>
        </div>
      </div>
      </div>
    </Layout>
  );
}

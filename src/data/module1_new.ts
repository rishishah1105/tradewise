export const newModule1 = {
    id: 'what-is-a-stock',
    title: 'What is a Stock?',
    category: 'Basics',
    categoryOrder: 1,
    prerequisites: [],
    estimatedMinutes: 25,
    xpReward: 100,
    summary: 'Discover how buying a share makes you a real part-owner of a corporation.',
    chapters: [
      {
        id: 'ch1-1',
        title: 'Chapter 1: What does owning a stock actually mean?',
        content: `When you hear people talking about "the stock market," it can sometimes sound like a giant casino or an impenetrable club for the ultra-rich. But at its core, the stock market is simply a place where businesses go to raise money, and where regular people go to buy a piece of those businesses.

Think of it this way: imagine you and your friends decide to start a local coffee shop. You need ₹10 Lakhs to get started. You put in ₹5 Lakhs, and five of your friends put in ₹1 Lakh each. To keep track of who owns what, you divide the coffee shop into 10 equal pieces, or "shares." You own 5 shares (50%), and each of your friends owns 1 share (10%).

A stock in the real world works exactly the same way, just on a massive scale. A stock (also known as equity) represents fractional ownership in a corporation. When you buy a share of a company, you aren't just buying a ticker symbol blinking on a screen; you are buying a tiny, legal slice of that actual business. 

Let's look at a real Indian market example. Take Reliance Industries Limited (RIL), one of India's largest conglomerates. Reliance is divided into roughly 676 crore (6.76 billion) shares. If you log into your brokerage account and buy 100 shares of Reliance Industries, you are now a part-owner of the company. You own a tiny fraction of their oil refineries in Jamnagar, their Jio telecom network, and every single Reliance Retail store across India. 

Because you are an owner, you have certain rights. You get the right to vote on major company decisions during their Annual General Meeting (AGM), though admittedly, with 100 shares, your voting power is extremely small compared to the promoters (the founders and main owners). More importantly, you have the right to a share of the company's profits, which we will discuss in later chapters.

The beauty of the stock market is that it democratizes wealth creation. You don't need billions of rupees to build a nationwide telecom network from scratch. You can simply buy shares of Bharti Airtel or Reliance Jio (via RIL) and participate in their success. The stock market allows you to partner with some of the smartest CEOs and best-run businesses in the country, passively benefiting from their hard work.`,
        keyTakeaways: [
          'A stock represents literal fractional ownership in a real business.',
          'When you buy shares of an Indian company like Reliance or TCS, you own a tiny piece of their assets and future profits.',
          'Stockholders have legal rights, including voting rights at Annual General Meetings (AGMs).'
        ]
      },
      {
        id: 'ch1-2',
        title: 'Chapter 2: How do companies list on the stock exchange?',
        content: `Now that you know what a stock is, you might be wondering how these shares end up available for you to buy in the first place. Companies aren't born on the stock exchange. They start as private businesses—often funded by the founders' own savings, bank loans, or venture capital.

As a company grows, it inevitably reaches a point where it needs a massive amount of capital (money) to expand. Maybe they want to build new factories, expand internationally, or pay off expensive debt. Instead of taking another bank loan, the company decides to invite the public to become co-owners. 

This process of transitioning from a private company to a public company is called an Initial Public Offering (IPO). 

Here is how the IPO process works in India. First, the company must hire investment bankers (merchant bankers) to help determine the company's valuation and the price at which the shares should be sold. Next, they must file a massive document called a Draft Red Herring Prospectus (DRHP) with SEBI. 

SEBI (the Securities and Exchange Board of India) is the supreme regulatory body for the Indian stock markets. Think of them as the referee. SEBI reviews the DRHP to ensure the company is being completely transparent about its business, its financials, and its risks. SEBI's job isn't to guarantee the company is a good investment, but to ensure that you, the investor, have all the truthful information needed to make your own decision.

Once SEBI gives the green light, the company issues its shares to the public during a 3-day IPO window. Investors apply for shares, and if there is high demand, the shares are allotted via a lottery system. 

After the IPO concludes, the shares are officially "listed" on the stock exchanges. In India, we have two primary stock exchanges: the National Stock Exchange (NSE) and the Bombay Stock Exchange (BSE). The BSE is the oldest stock exchange in Asia, established in 1875 under a banyan tree in Mumbai, while the NSE is a newer, fully automated electronic exchange that handles the majority of the trading volume today.

Once listed on the NSE and BSE, the shares can be freely bought and sold between investors in the secondary market. From this point on, the company itself is no longer involved in the daily buying and selling; investors are simply trading shares among themselves.`,
        keyTakeaways: [
          'An Initial Public Offering (IPO) is the process where a private company sells shares to the public for the first time.',
          'SEBI is the regulator that ensures companies provide truthful financial information to protect investors.',
          'The NSE and BSE are the two main electronic marketplaces in India where public shares are traded.'
        ]
      },
      {
        id: 'ch1-3',
        title: 'Chapter 3: How stock prices move',
        content: `If you watch a stock ticker on the NSE during market hours (9:15 AM to 3:30 PM), you'll see prices fluctuating every single second. But what actually causes a stock price to go up from ₹500 to ₹505, or drop to ₹490?

The short answer is: Supply and Demand. 

The stock market is essentially a giant, continuous auction. For every transaction that happens on the NSE, there must be two parties: a buyer who thinks the stock will go up (or is worth holding), and a seller who thinks the stock will go down (or needs the cash). 

If there is overwhelming positive news about a company—let's say Tata Motors announces a breakthrough in EV battery technology and reports double the expected profits—investors will rush to buy the stock. Because there are more eager buyers than willing sellers, the buyers must offer higher and higher prices to convince the sellers to part with their shares. This intense buyer demand drives the stock price up.

Conversely, imagine if a major IT company like Infosys announces that they lost their biggest client in the US, and their profits are expected to plunge. Panic sets in. Investors holding the stock want to sell it immediately before it falls further. But buyers are scarce because the news is bad. To find a buyer, the sellers must continually lower their asking price. This intense selling pressure drives the stock price down.

In the short term, stock prices are heavily influenced by "market sentiment"—human emotions of greed and fear, news headlines, and global economic events. If the US Federal Reserve raises interest rates, or if there is a geopolitical conflict, the entire Indian market might fall simply out of fear, pulling down the prices of fundamentally good companies along with the bad ones.

However, in the long term, a stock's price is a weighing machine that tracks the company's underlying earnings (profits). If a company consistently grows its profits year after year, the value of the business increases, and the stock price will inevitably follow that upward trajectory, regardless of short-term noise.`,
        keyTakeaways: [
          'Stock prices move based on real-time supply (sellers) and demand (buyers).',
          'Short-term price movements are driven by market sentiment, news, and emotions (fear and greed).',
          'Long-term stock prices are driven by the actual financial growth and earnings of the company.'
        ]
      },
      {
        id: 'ch1-4',
        title: 'Chapter 4: How do you make money from stocks?',
        content: `Ultimately, the reason you are taking the time to learn about the stock market is to grow your wealth. When you buy a stock, there are two primary ways you actually make money: Capital Appreciation (Capital Gains) and Dividends.

1. Capital Appreciation
This is the most common way investors grow their wealth. Capital appreciation happens when the market price of your stock increases over time, and you sell it for more than you paid. 

Let's look at a real historical example on the NSE. In 2010, you could have bought shares of Bajaj Finance for around ₹40 per share (adjusted for splits). Fast forward to 2024, and the business had grown exponentially, expanding its lending operations across India. As the business grew, so did demand for its stock, pushing the price above ₹7,000 per share. If you bought 100 shares in 2010 for ₹4,000 and sold them in 2024 for ₹7,00,000, that massive profit is your capital gain.

However, remember that capital gains are unrealized (just numbers on a screen) until you actually sell the stock. Once you hit the "Sell" button, the profit is realized and hits your bank account.

2. Dividends
The second way you make money is through dividends. Remember that as a shareholder, you are a part-owner of the business. When the company makes a net profit at the end of the year, the management team has a choice. They can reinvest that profit back into the business to build new factories (which hopefully drives capital appreciation), or they can distribute a portion of that cash directly to the shareholders. This cash payout is a dividend.

Mature, stable Indian companies with predictable cash flows—like ITC, Coal India, or TCS—are famous for paying regular, handsome dividends. If a company declares a dividend of ₹15 per share, and you own 1,000 shares, you will receive ₹15,000 deposited directly into your linked bank account, completely independent of what the stock price is doing on the exchange that day.

The best long-term investments often provide a combination of both: steady capital appreciation as the business grows, plus a growing stream of dividend income year after year. Total Return = Capital Gains + Dividends.`,
        keyTakeaways: [
          'Capital gains occur when you sell a stock for a higher market price than your initial purchase price.',
          'Dividends are direct cash payouts made by the company to its shareholders from its annual profits.',
          'Your total return as an investor is the sum of your capital gains and all dividends collected.'
        ]
      },
      {
        id: 'ch1-5',
        title: 'Chapter 5: Risks every stock investor must understand',
        content: `It is impossible to talk about the immense wealth-creation potential of the stock market without talking about the risks. Unlike a Fixed Deposit (FD) in an SBI bank account, where your principal is guaranteed by the government and you earn a fixed interest rate, the stock market offers zero guarantees. You can lose some, or even all, of your invested capital. 

To survive and thrive, you must understand the three main types of risk:

1. Company-Specific Risk (Business Risk)
This is the risk that the specific company you invested in performs poorly. Perhaps the CEO makes a terrible acquisition, a competitor releases a far superior product, or the company is caught in a massive accounting fraud. A stark Indian example is Yes Bank. In 2018, Yes Bank was a high-flying stock trading near ₹400. Due to severe mismanagement and bad loans, the business nearly collapsed, and the stock price crashed below ₹15, destroying massive shareholder wealth. You mitigate this risk through diversification—not putting all your money into one stock.

2. Market Risk (Systematic Risk)
Sometimes, the company you own is performing perfectly well, but the entire stock market crashes due to macroeconomic factors. This is market risk. A perfect example is the COVID-19 crash in March 2020. Fundamentally strong Indian companies like HDFC Bank and Asian Paints saw their stock prices plummet by 30% to 40% in a matter of weeks, not because they did anything wrong, but because global panic caused investors to liquidate everything. Market risk cannot be diversified away with more stocks; you endure it by having a long-term time horizon and not panicking.

3. Liquidity Risk
Liquidity refers to how easily you can buy or sell a stock without affecting its price. Large-cap stocks like Reliance or Infosys are highly liquid—millions of shares trade hands every day, so you can exit your position instantly. However, if you invest in obscure "penny stocks" or very small companies, you face liquidity risk. If bad news hits a small-cap stock, every investor might try to sell at once, but there are no buyers. The stock hits its "lower circuit" limit on the NSE, freezing trading, and you are literally trapped, unable to sell your shares as the value evaporates daily.

Understanding these risks isn't meant to scare you away; it is meant to make you a disciplined, rational investor.`,
        keyTakeaways: [
          'Stock market returns are never guaranteed, and you can lose your principal investment.',
          'Company risk is the danger of a specific business failing, which can be mitigated by diversifying your portfolio.',
          'Market risk involves systemic global events (like recessions or pandemics) that pull down the entire market temporarily.'
        ]
      }
    ],
    visualAidType: 'stock-equity-visual',
    keyTakeaways: [
      'A stock represents true fractional ownership in a business.',
      'Prices are driven by supply, demand, and corporate earnings.',
      'You profit through Capital Gains and Cash Dividends.',
      'Always respect market, company, and liquidity risks.'
    ],
    quiz: [
      {
        id: 'q1-1',
        question: 'What does buying a share of stock mathematically represent?',
        chapterId: 'ch1-1',
        type: 'multiple-choice',
        options: [
          'A fixed-interest personal loan to the founder',
          'Proportional fractional ownership in the corporation',
          'A contract to buy products at a 50% discount',
          'A government insurance certificate'
        ],
        correctAnswer: 1,
        explanation: 'As explained in Chapter 1, buying a stock gives you fractional equity ownership in the business.'
      },
      {
        id: 'q1-2',
        question: 'What is the role of SEBI in an Initial Public Offering (IPO)?',
        chapterId: 'ch1-2',
        type: 'multiple-choice',
        options: [
          'To guarantee the stock price will go up after listing',
          'To lend money to the company for expansion',
          'To ensure the company provides transparent and truthful financial information to investors',
          'To set the exact maximum price the stock can reach on the NSE'
        ],
        correctAnswer: 2,
        explanation: 'Chapter 2 explains that SEBI acts as the regulator to ensure companies are completely transparent about their financials and risks before an IPO.'
      },
      {
        id: 'q1-3',
        question: 'What primarily drives the short-term price movements of a stock on the NSE?',
        chapterId: 'ch1-3',
        type: 'multiple-choice',
        options: [
          'The exact number of employees at the company',
          'The real-time supply (sellers) and demand (buyers) driven by market sentiment',
          'A fixed formula published monthly by the RBI',
          'The age of the company CEO'
        ],
        correctAnswer: 1,
        explanation: 'Chapter 3 details how short-term prices act like an auction, driven by the intense supply and demand created by human fear, greed, and news.'
      },
      {
        id: 'q1-4',
        question: 'How do established Indian companies directly share their annual net profits with stock investors?',
        chapterId: 'ch1-4',
        type: 'multiple-choice',
        options: [
          'By paying direct cash Dividends into the investors bank accounts',
          'By issuing them free products at Reliance Retail',
          'By offering them jobs at the company headquarters',
          'By forgiving their bank loans'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 4 highlights that mature companies distribute a portion of their net profits directly to shareholders as cash dividends.'
      },
      {
        id: 'q1-5',
        question: 'What type of risk occurred during the March 2020 COVID-19 crash when fundamentally strong companies saw their prices plummet?',
        chapterId: 'ch1-5',
        type: 'multiple-choice',
        options: [
          'Liquidity Risk',
          'Company-Specific Risk',
          'Systematic Market Risk',
          'Currency Exchange Risk'
        ],
        correctAnswer: 2,
        explanation: 'Chapter 5 explains that Systematic Market Risk affects the entire stock market due to macroeconomic panic, even when individual companies are doing nothing wrong.'
      }
    ]
  };

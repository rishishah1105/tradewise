export interface Chapter {
  id: string;
  title: string;
  content: string;
  example?: string;
  keyPoint?: string;
  keyTakeaways?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  chapterId: string;
  type: 'multiple-choice' | 'true-false' | 'match';
  options: string[];
  correctAnswer: number | string;
  explanation: string;
}

export interface ConceptModule {
  id: string;
  title: string;
  category: 'Basics' | 'Risk & Diversification' | 'Instruments' | 'Trading Mechanics' | 'Portfolio Strategy';
  categoryOrder: number;
  prerequisites: string[];
  estimatedMinutes: number;
  xpReward: number;
  summary: string;
  chapters: Chapter[];
  visualAidType: 
    | 'compounding-calculator'
    | 'sip-growth'
    | 'diversification-pie'
    | 'risk-return-scatter'
    | 'candlestick-interactive'
    | 'order-book-visualizer'
    | 'bid-ask-margin'
    | 'pe-ratio-comparator'
    | 'etf-breakdown'
    | 'stock-equity-visual'
    | 'bond-yield-timeline'
    | 'portfolio-allocation-slider'
    | 'dca-simulator';
  keyTakeaways: string[];
  quiz: QuizQuestion[];
}

export const MODULES_DATA: ConceptModule[] = [
  // 1. WHAT IS A STOCK
  {
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
  },
  // 2. WHAT IS A BOND
      {
    id: 'what-is-a-bond',
    title: 'What is a Bond?',
    category: 'Basics',
    categoryOrder: 2,
    prerequisites: ['what-is-a-stock'],
    estimatedMinutes: 25,
    xpReward: 100,
    summary: 'Understand fixed-income debt instruments where you act as lender to governments or corporations.',
    chapters: [
      {
        id: 'ch2-1',
        title: 'Chapter 1: What is a bond and why do governments and companies issue them?',
        content: `When you invest in a stock, you are buying a piece of equity—you become a part-owner of the company. However, when you buy a bond, you are engaging in debt financing. You are not an owner; you are a lender. 

Governments and large corporations constantly need massive amounts of money. The Government of India needs thousands of crores to build new highways, airports, and fund social programs. Similarly, a massive corporation like Reliance Industries might need cash to build a new refinery or acquire another company. Instead of going to a single bank for a massive loan, they go to the public markets and issue bonds.

Think of it this way: a bond is simply an official IOU. You lend your money to the issuer for a specific period of time. In return, the issuer promises to pay you regular interest, and then return your original money on a specific future date.

For example, when the Government of India issues Government Securities (G-Secs), they are borrowing money from investors. Because the government has the power to tax citizens and print money, the chance of them defaulting (failing to pay you back) is virtually zero. This makes government bonds one of the safest investments available. On the other hand, if Reliance Industries issues corporate bonds to fund an expansion, they might pay a slightly higher interest rate than the government, compensating you for the very small risk that the business could theoretically fail.

Why would an investor choose to lend money rather than buy stocks? Certainty. Stocks can fall 30% in a month if there is an economic crisis. Bonds provide a predictable, mathematically certain stream of income. For retirees who need regular monthly income to pay for groceries and medical bills, the certainty of a bond is far more valuable than the aggressive, unpredictable growth potential of a stock.`,
        keyTakeaways: [
          'Buying a stock makes you an owner, but buying a bond makes you a lender (debt financing).',
          'Governments issue G-Secs for infrastructure, while companies issue corporate bonds for expansion.',
          'Bonds offer certainty and regular income, making them much safer than volatile stocks.'
        ]
      },
      {
        id: 'ch2-2',
        title: 'Chapter 2: Key bond terms every investor must know',
        content: `To invest in bonds confidently, you only need to understand four critical terms: Face Value, Coupon Rate, Maturity Date, and Yield to Maturity. Let's break them down using a real example.

1. Face Value (Principal)
This is the original amount of money that the bond is issued for. It is the amount you are lending. For example, let's say the Reserve Bank of India (RBI) issues a new 10-year Government Security (G-Sec) with a face value of ₹10,000.

2. Coupon Rate
The coupon rate is the fixed annual interest percentage the borrower promises to pay you, based on the face value. If the RBI G-Sec has a coupon rate of 7.1%, it means the government will pay you ₹710 every single year (7.1% of ₹10,000) for holding the bond. This rate is locked in when the bond is issued and usually does not change.

3. Maturity Date
This is the exact future date when the bond expires and the borrower must return your original Face Value. If you buy the 10-year G-Sec in 2024, the maturity date will be in 2034. On that date, you receive your final ₹710 interest payment, plus your original ₹10,000 back.

4. Yield to Maturity (YTM)
This is where it gets interesting. While the Face Value is ₹10,000, you can actually sell your bond to another investor on the stock exchange before 2034. Because bond prices fluctuate on the market, a buyer might purchase your bond for ₹9,500 or ₹10,500. Yield to Maturity (YTM) is the actual total return percentage that buyer will earn if they hold the bond until maturity, accounting for both the interest payments and the price they paid. 

When you buy a bond directly from the RBI at issue, the math is simple. You invest ₹10,000. Every year, you receive ₹710. After exactly ten years, the government returns your ₹10,000. The predictability is absolute.`,
        keyTakeaways: [
          'Face Value is the initial principal amount you are lending to the issuer.',
          'Coupon Rate is the fixed percentage of interest paid to you annually.',
          'Maturity Date is the exact day your original Face Value is returned to you.'
        ]
      },
      {
        id: 'ch2-3',
        title: 'Chapter 3: How bond prices and interest rates move in opposite directions',
        content: `This is the most counterintuitive concept in all of finance, so read carefully: Bond prices and interest rates move in opposite directions. When interest rates go up, existing bond prices go down. When interest rates go down, existing bond prices go up.

Why? Let's look at a real Indian market example.

Between 2022 and 2023, the RBI aggressively hiked the repo rate (the benchmark interest rate) from 4.0% to 6.5% to fight inflation. 

Imagine it is 2021, and interest rates are low. You buy a 10-year Government Bond with a Face Value of ₹10,000 that pays a 5% coupon (₹500 per year). You are happy with your safe, steady income.

Fast forward to 2023. The RBI has hiked rates to 6.5%. Now, the government issues brand new 10-year bonds, and because interest rates are higher, these new bonds pay a 7% coupon (₹700 per year).

Suddenly, you need cash and want to sell your 5% bond to another investor on the market. You ask for your ₹10,000 back. The investor will look at you and say, "Why would I pay you ₹10,000 for a bond that only pays ₹500 a year, when I can buy a brand new bond from the RBI for ₹10,000 that pays ₹700 a year?"

To convince the investor to buy your older, lower-paying bond, you are forced to drop the price. You might have to sell it for ₹9,200. The buyer gets the ₹500 a year, PLUS they make a profit when the bond matures and the government pays them the full ₹10,000 Face Value. 

This is exactly what happened to bondholders in 2022. As the RBI hiked rates, the market value of their older bonds fell. Conversely, if the RBI aggressively cuts interest rates in the future, your older 7% bonds become incredibly valuable, and buyers will pay a premium (say, ₹10,800) just to get their hands on that high fixed income. 

This is why active bond traders monitor the RBI monetary policy obsessively.`,
        keyTakeaways: [
          'Bond prices and market interest rates have an inverse relationship.',
          'If the RBI raises interest rates, the resale value of your existing bonds will fall.',
          'If you hold a bond until maturity, market price fluctuations do not matter; you get your full principal back.'
        ]
      },
      {
        id: 'ch2-4',
        title: 'Chapter 4: Types of bonds available to Indian investors',
        content: `The Indian debt market offers a variety of bonds tailored for different time horizons and risk profiles. Here are the four major types you should know:

1. Government Securities (G-Secs)
These are long-term bonds issued by the Central or State Governments, with maturities ranging from 5 to 40 years. Because they are backed by the sovereign Government of India, they carry virtually zero default risk. They typically offer moderate returns (around 7% to 7.5%) and are excellent for locking in long-term safe income. Minimum investment is just ₹10,000 through the RBI Retail Direct portal.

2. Treasury Bills (T-Bills)
If you only want to lend money for a few months, T-Bills are the answer. Also issued by the government, these are short-term instruments that mature in 91 days, 182 days, or 364 days. Instead of paying regular interest, they are issued at a discount. You buy a ₹100 T-Bill for ₹98 today, and in 91 days, the government gives you ₹100. They are ultra-safe parking spots for idle cash.

3. Sovereign Gold Bonds (SGBs)
This is a unique, brilliant instrument issued by the RBI on behalf of the government. Instead of buying physical gold (which requires paying making charges and locker fees), you buy paper bonds linked to the exact market price of 1 gram of gold. Not only do you get the capital appreciation if the price of gold goes up over the 8-year maturity, but the RBI also pays you an extra 2.5% fixed interest every year just for holding it! Plus, if held to maturity, the capital gains are entirely tax-free. Historically, SGBs have massively outperformed physical gold.

4. Corporate Bonds
These are issued by private companies (like HDFC Bank, Tata Motors, or Muthoot Finance) to fund their business. Because private companies can go bankrupt, corporate bonds carry higher risk than G-Secs. To compensate for this risk, they offer higher interest rates, often ranging from 8% to 10%. Investors rely on credit rating agencies like CRISIL to grade these bonds (e.g., AAA is highly safe, while C is high risk of default).`,
        keyTakeaways: [
          'G-Secs and T-Bills are issued by the government and carry essentially zero default risk.',
          'Sovereign Gold Bonds (SGBs) track the price of gold while paying an additional 2.5% annual interest.',
          'Corporate bonds pay higher interest rates but come with the risk of company default.'
        ]
      },
      {
        id: 'ch2-5',
        title: 'Chapter 5: Bonds vs stocks — building a balanced perspective',
        content: `One of the biggest mistakes beginners make is asking, "Which is better: stocks or bonds?" The truth is, they serve entirely different purposes. Investing is not about choosing a side; it is about knowing which tool to use for the right job.

Stocks are the engines of wealth creation. Over long decades, the Nifty 50 has consistently beaten inflation and delivered double-digit returns. However, stocks are volatile. They can crash 30% in a month. For a young 25-year-old investor with 35 years until retirement, this volatility doesn't matter much. They should hold mostly stocks because they have the time to wait for the market to recover.

Bonds are the shock absorbers of your portfolio. They provide capital protection and guaranteed income. For a 65-year-old retiree who needs ₹50,000 a month to live, relying entirely on the stock market is terrifying. If the market crashes, they are forced to sell their stocks at massive losses just to buy food. Retirees shift heavily into bonds because the fixed coupon payments arrive predictably, regardless of whether the stock market is crashing or booming.

Here is a real example of why having both is powerful. During the intense COVID-19 crash in March 2020, fear gripped the world. The Nifty 50 stock index plummeted a brutal 38% in a matter of weeks. Stock portfolios were decimated. 

However, during that exact same period, nervous investors sold their risky assets and flooded into the safety of government bonds. The RBI aggressively cut interest rates to stimulate the economy. As you learned in Chapter 3, when rates fall, bond prices rise. Investors holding long-duration G-Sec bond mutual funds actually saw their portfolios give double-digit POSITIVE returns while the stock market was burning down. 

Bonds zig when stocks zag. By holding a mix of both (asset allocation), you ensure that a portion of your wealth is aggressively growing, while another portion is safely anchored, providing cash and peace of mind during inevitable global crises.`,
        keyTakeaways: [
          'Stocks are the engine for aggressive wealth creation; bonds are the shock absorbers for safety.',
          'Young investors should focus heavily on stocks, while retirees need the steady income of bonds.',
          'During extreme stock market crashes like March 2020, safe bonds often rise in value, balancing your portfolio.'
        ]
      }
    ],
    visualAidType: 'bond-yield-timeline',
    keyTakeaways: [
      'Bonds are debt financing: you act as the lender, not an owner.',
      'Bond prices fall when RBI interest rates rise.',
      'Sovereign Gold Bonds (SGBs) and G-Secs offer government-backed safety.',
      'Use stocks for growth and bonds for capital protection.'
    ],
    quiz: [
      {
        id: 'q2-1',
        question: 'What is the fundamental difference between buying a stock and buying a bond?',
        chapterId: 'ch2-1',
        type: 'multiple-choice',
        options: [
          'A bond makes you a lender to the issuer, while a stock makes you a part-owner',
          'Bonds are only issued by tech startups, stocks are issued by governments',
          'Bonds never pay cash to investors',
          'Stocks guarantee a return of your principal amount'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 1 establishes that bonds are debt financing (you are lending), while stocks are equity financing (you are owning).'
      },
      {
        id: 'q2-2',
        question: 'If you buy a 10-year Government Security with a Face Value of ₹10,000 and a Coupon Rate of 7%, how much interest will you receive annually?',
        chapterId: 'ch2-2',
        type: 'multiple-choice',
        options: [
          '₹7,000',
          '₹700',
          '₹10,000',
          '₹70'
        ],
        correctAnswer: 1,
        explanation: 'Chapter 2 explains that the coupon is a percentage of the Face Value. 7% of ₹10,000 is ₹700.'
      },
      {
        id: 'q2-3',
        question: 'If the RBI aggressively hikes interest rates from 4% to 6.5%, what happens to the market price of existing older bonds?',
        chapterId: 'ch2-3',
        type: 'multiple-choice',
        options: [
          'The price of older bonds goes down',
          'The price of older bonds goes up',
          'The price stays exactly the same',
          'The older bonds are cancelled by the government'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 3 highlights the inverse relationship: when new rates go up, older lower-paying bonds become less attractive, driving their market price down.'
      },
      {
        id: 'q2-4',
        question: 'Which bond instrument allows you to track the market price of gold while also paying you an additional 2.5% annual interest?',
        chapterId: 'ch2-4',
        type: 'multiple-choice',
        options: [
          'Corporate Bonds',
          'Treasury Bills (T-Bills)',
          'Sovereign Gold Bonds (SGBs)',
          'Nifty 50 Index Funds'
        ],
        correctAnswer: 2,
        explanation: 'Chapter 4 details Sovereign Gold Bonds (SGBs) as a unique instrument that tracks gold prices while paying a 2.5% fixed interest.'
      },
      {
        id: 'q2-5',
        question: 'Why did long-duration government bonds perform well during the March 2020 stock market crash?',
        chapterId: 'ch2-5',
        type: 'multiple-choice',
        options: [
          'Because the stock market crash caused the government to declare bankruptcy',
          'Because investors fled to safety and the RBI cut rates, pushing bond prices up',
          'Because the bond coupons were tied directly to the price of Nifty 50',
          'Because bonds are actually a type of digital currency'
        ],
        correctAnswer: 1,
        explanation: 'Chapter 5 shows that during panics, investors buy safe bonds, and central banks cut rates, both of which drive bond prices higher.'
      }
    ]
  },
  // 3. COMPOUNDING INTEREST
      {
    id: 'compounding-interest',
    title: 'Compounding Interest: The 8th Wonder',
    category: 'Basics',
    categoryOrder: 3,
    prerequisites: ['what-is-a-stock'],
    estimatedMinutes: 25,
    xpReward: 120,
    summary: 'See how earning interest on top of past interest creates exponential wealth over time.',
    chapters: [
      {
        id: 'ch3-1',
        title: 'Chapter 1: What is compounding and why does time matter more than amount?',
        content: `There is a famous quote often misattributed to Albert Einstein: "Compound interest is the eighth wonder of the world. He who understands it, earns it... he who doesn't... pays it." Whether Einstein actually said it or not, the mathematical reality of compounding is the single most important concept in personal finance.

To understand compounding, you must first understand simple interest. Let’s say you invest ₹10,000 into a scheme that pays 10% simple interest every year. 
In Year 1, you earn 10% of ₹10,000 = ₹1,000. 
In Year 2, you earn 10% of the original ₹10,000 = ₹1,000. 
After 10 years, you have collected ₹1,000 ten times (₹10,000), leaving you with a total corpus of ₹20,000. Your money grew in a straight, linear line.

Now, let's look at compound interest. The core rule of compounding is "interest on interest." Instead of withdrawing the ₹1,000 you made in Year 1, you leave it in the account.
In Year 1, you earn 10% on ₹10,000 = ₹1,000. (Total is now ₹11,000).
In Year 2, you don't earn interest on just the original ten thousand; you earn 10% on the new total of ₹11,000! So you earn ₹1,100. (Total is now ₹12,100).
By Year 10, your money isn’t growing by ₹1,000 a year anymore; it’s growing by ₹2,357 a year. Your final corpus is nearly ₹26,000. 

While the difference over 10 years looks small, compounding is an exponential curve. If you leave that same ₹10,000 compounding at 10% for 40 years, it doesn't just double or triple. It explodes to ₹4.5 Lakhs! The later years are where the magic happens, as massive sums of accumulated interest begin generating even more massive interest. This is why time in the market is vastly more powerful than the initial amount you invest.`,
        keyTakeaways: [
          'Simple interest only pays returns on your original investment.',
          'Compound interest pays returns on your principal AND your past accumulated interest.',
          'Compounding is an exponential curve—the most explosive growth happens in the later years.'
        ]
      },
      {
        id: 'ch3-2',
        title: 'Chapter 2: The compounding formula and what each variable means',
        content: `You don't need to be a math genius to be a successful investor, but understanding the mechanics behind the compounding formula will fundamentally change how you view money. 

The formula is: A = P(1 + r/n)^(nt)

Let’s translate that into plain English:
- **A (Final Amount):** The massive corpus of wealth you end up with.
- **P (Principal):** The initial money you put to work.
- **r (Rate of Return):** The percentage your money grows every year (e.g., 12%).
- **t (Time):** The number of years you leave the money completely alone. 

Notice that time (t) is an exponent. It is the only variable in the formula that acts as a multiplier.

Let's walk through three scenarios to see how the Rate of Return (r) dramatically alters your wealth over a 20-year time horizon (t). Imagine you invest exactly ₹1 Lakh today and don't touch it for two decades.

Scenario 1: You put ₹1 Lakh in a safe Fixed Deposit (FD) earning 8%. After 20 years, it grows to roughly ₹4.6 Lakhs. Not bad, your money grew over 4x.
Scenario 2: You invest ₹1 Lakh in a Nifty 50 Index fund earning an average of 12%. After 20 years, it grows to nearly ₹9.6 Lakhs. By increasing the rate by just 4%, you doubled your final wealth!
Scenario 3: You invest ₹1 Lakh in a highly successful small-cap fund earning 15%. After 20 years, it explodes to over ₹16 Lakhs!

This mathematically proves why investors are willing to endure the volatility of the stock market. Over long periods (the exponent 't'), even a tiny 3% increase in your annual rate of return creates millions of rupees in extra wealth because the "interest on interest" effect accelerates exponentially.`,
        keyTakeaways: [
          'Time is the exponent in the compounding formula, making it the most powerful variable.',
          'Even small increases in your annual rate of return lead to massive differences over decades.',
          'Long time horizons justify the risks of the stock market because they unlock the later stages of the exponential curve.'
        ]
      },
      {
        id: 'ch3-3',
        title: 'Chapter 3: Real Indian market example — Nifty 50 compounding',
        content: `The math from the previous chapter sounds great in theory, but does it actually work in the chaotic real world of the Indian economy? Yes. To prove it, we just have to look at the history of the Nifty 50, the flagship index representing the 50 largest companies in India.

The Nifty 50 index was formally launched in April 1996 with a base value of 1,000. 

Think about everything India has endured since 1996. We had the Asian Financial Crisis in 1997. We had the Dot-com crash of 2001. We experienced the terrifying 2008 Global Financial Crisis where markets lost half their value in a year. We had demonetization in 2016. And we lived through the unprecedented COVID-19 crash in March 2020. 

Despite all of those terrifying, headline-grabbing disasters, where is the Nifty 50 today? In early 2024, the index decisively crossed the 22,000 mark. 

If you had invested ₹1 Lakh into a Nifty 50 index fund back when it launched at 1,000 points, and you simply forgot about it—ignoring every single market crash, every news panic, and every political election—your ₹1 Lakh would have compounded to roughly ₹22 Lakhs by 2024. 

This represents a Compound Annual Growth Rate (CAGR) of approximately 11.5% to 12% over a 28-year period (excluding dividends, which would make the total return even higher). 

The investors who achieved this massive 22x return weren't the smartest traders. They weren't timing the market. They were simply the ones who possessed the psychological discipline to do absolutely nothing during crashes. The magic of compounding requires uninterrupted time. Every time you panic and sell during a crash, you break the chain of compounding and reset the exponential curve.`,
        keyTakeaways: [
          'The Nifty 50 grew from a base of 1,000 in 1996 to over 22,000 in 2024 despite multiple global crises.',
          'Historical Indian market data shows a long-term CAGR of roughly 12% for large-cap stocks.',
          'Panic selling during crashes interrupts compounding and destroys long-term wealth.'
        ]
      },
      {
        id: 'ch3-4',
        title: 'Chapter 4: Inflation — the silent destroyer of compounding',
        content: `Now that you are excited about compounding your wealth at 12%, we need to discuss the silent villain that is actively trying to destroy your purchasing power every single day: Inflation.

Inflation is the rate at which the general cost of goods and services increases over time. If a cup of coffee costs ₹100 today, and inflation is 6% this year, that exact same cup of coffee will cost ₹106 next year. 

Because of inflation, the "Nominal Return" (the raw percentage your investment earns) is an illusion. What actually matters is your "Real Return," which is your Nominal Return minus Inflation.

Let's look at a harsh real-world example. Imagine you have ₹1 Lakh, and you are afraid of the stock market. You put your money into an SBI savings account that pays 3.5% interest a year. You feel safe because your balance goes up to ₹1,03,500 after one year. Your nominal return is 3.5%.

However, during that same year, inflation in India runs at 6%. The cost of groceries, petrol, and rent went up by 6%. 
Real Return = Nominal Return (3.5%) - Inflation (6%) = -2.5%. 

Even though you technically have more rupee notes in your account, your actual purchasing power has decreased. You are silently getting poorer safely! 

What if you use a Fixed Deposit (FD) paying 6.5%? 
Real Return = FD (6.5%) - Inflation (6%) = +0.5%. 
You are barely keeping your head above water. You preserve your wealth, but you aren't growing it.

This is exactly why you MUST invest a portion of your wealth into assets that outpace inflation, like stocks or equity mutual funds. If a Nifty 50 index fund returns 12% over the long term, and inflation averages 6%, your Real Return is a healthy +6%. The stock market isn't just a place to get rich; it is an absolute necessity to protect your savings from the silent erosion of inflation.`,
        keyTakeaways: [
          'Inflation is the rate at which the cost of living increases, eroding your purchasing power.',
          'Real Return is your raw investment return minus the rate of inflation.',
          'Safe instruments like savings accounts often yield negative real returns, making you silently poorer.'
        ]
      },
      {
        id: 'ch3-5',
        title: 'Chapter 5: The cost of waiting — starting at 22 vs 32',
        content: `The most common excuse beginners use is, "I don't have enough money to invest right now. I'll wait until I get promoted in my 30s when I have a bigger salary." This chapter will mathematically prove why that is the most expensive mistake you can ever make.

Let’s look at the classic example of two friends, Rishi and Rahul.

Rishi is 22 years old, just out of college, earning a modest salary. He decides to invest ₹5,000 every month into an equity mutual fund earning a 12% CAGR. He does this for exactly 10 years, until he turns 32. At age 32, he completely stops investing new money. He has put in a total of ₹6 Lakhs. He leaves that money untouched in the market until he turns 60.

Rahul, on the other hand, wants to live lavishly in his 20s. He waits until he is 32 to start investing. Realizing he is behind, Rahul also invests ₹5,000 every month at 12%. However, Rahul doesn't stop after 10 years. He keeps investing ₹5,000 every single month for 28 straight years until he turns 60. Rahul has put in a massive total of ₹16.8 Lakhs from his own pocket.

Who has more money at age 60?

Rishi, who only invested ₹6 Lakhs and stopped at 32, ends up with approximately ₹2.7 Crores.
Rahul, who diligently invested ₹16.8 Lakhs over 28 years, ends up with roughly ₹1.3 Crores.

Despite investing nearly triple the amount of his own money, Rahul ends up with less than half of Rishi's wealth. Why? Because Rishi gave his money a 38-year runway to compound. By the time Rahul even started, Rishi's initial money had already entered the steep, explosive phase of the exponential curve. Rahul's money simply ran out of time.

The takeaway is brutally simple: Start right now. Even if you can only afford ₹500 a month, the sheer power of time will do the heavy lifting for you.`,
        keyTakeaways: [
          'Starting to invest early is mathematically far more powerful than investing larger amounts later in life.',
          'Delaying your investments by just 10 years can cost you over half of your potential retirement wealth.',
          'Start immediately with whatever small amount you can afford to let time work for you.'
        ]
      }
    ],
    visualAidType: 'compounding-calculator',
    keyTakeaways: [
      'Compounding is earning interest on past interest, leading to exponential growth.',
      'Time is the most critical variable in wealth creation.',
      'You must invest in equities to beat inflation and achieve positive real returns.',
      'Delaying your investments is the most expensive financial mistake you can make.'
    ],
    quiz: [
      {
        id: 'q3-1',
        question: 'What is the primary difference between simple interest and compound interest?',
        chapterId: 'ch3-1',
        type: 'multiple-choice',
        options: [
          'Compound interest earns returns on the principal PLUS past accumulated interest',
          'Simple interest only works for stock investments',
          'Compound interest guarantees a 20% return',
          'Simple interest is illegal in India'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 1 clearly defines that compound interest creates exponential growth by earning interest on past interest.'
      },
      {
        id: 'q3-2',
        question: 'In the compounding formula, which variable acts as the powerful exponent?',
        chapterId: 'ch3-2',
        type: 'multiple-choice',
        options: [
          't (Time in years)',
          'P (Initial Principal)',
          'r (Rate of Return)',
          'A (Final Amount)'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 2 shows that time (t) is the exponent, which is why giving investments decades to grow is mathematically so critical.'
      },
      {
        id: 'q3-3',
        question: 'What happens to compounding growth if you panic and sell your investments during a market crash?',
        chapterId: 'ch3-3',
        type: 'multiple-choice',
        options: [
          'You lock in higher tax rates',
          'You interrupt the compounding chain and reset the exponential curve',
          'The NSE refunds your losses',
          'Your remaining cash grows twice as fast'
        ],
        correctAnswer: 1,
        explanation: 'Chapter 3 warns that pulling money out during crashes like 2008 or 2020 destroys the uninterrupted time required for compounding.'
      },
      {
        id: 'q3-4',
        question: 'If an SBI Fixed Deposit pays 6.5% interest, but inflation is running at 6%, what is your Real Return?',
        chapterId: 'ch3-4',
        type: 'multiple-choice',
        options: [
          '+ 12.5%',
          '+ 0.5%',
          '- 0.5%',
          '+ 6.0%'
        ],
        correctAnswer: 1,
        explanation: 'Chapter 4 explains that Real Return = Nominal Return (6.5%) minus Inflation (6%), leaving a tiny 0.5% real gain.'
      },
      {
        id: 'q3-5',
        question: 'In the Rishi vs Rahul example, why did Rishi end up with vastly more money despite investing far less cash?',
        chapterId: 'ch3-5',
        type: 'multiple-choice',
        options: [
          'Because Rishi gave his investments a 38-year time runway to compound exponentially',
          'Because Rishi picked better stocks',
          'Because Rahul forgot to pay taxes',
          'Because the bank gave Rishi a bonus'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 5 proves that starting 10 years earlier allows the math of compounding to heavily outpace larger cash investments made later in life.'
      }
    ]
  },
  // 4. SIPS EXPLAINED
      {
    id: 'sips-explained',
    title: 'Systematic Investment Plans (SIP)',
    category: 'Basics',
    categoryOrder: 4,
    prerequisites: ['compounding-interest'],
    estimatedMinutes: 25,
    xpReward: 110,
    summary: 'Learn automated rupee-cost investing to build financial discipline without timing the market.',
    chapters: [
      {
        id: 'ch4-1',
        title: 'Chapter 1: What is a SIP and how does it work mechanically?',
        content: `A Systematic Investment Plan (SIP) is not an asset class or a specific mutual fund. It is simply a disciplined method of investing. An SIP is a standing instruction you give to your bank and a mutual fund house to automatically debit a fixed amount of money on a specific date every month, and invest it into a specific fund.

Mechanically, here is exactly what happens. Let’s say you set up a ₹5,000 monthly SIP into the HDFC Nifty 50 Index Fund, scheduled for the 5th of every month. 

On the 5th, your bank automatically transfers ₹5,000 to the HDFC mutual fund. At the end of that trading day, the fund calculates its Net Asset Value (NAV). The NAV is simply the price of one single "unit" of the mutual fund on that specific day. 

If the NAV on January 5th is ₹100, your ₹5,000 purchases exactly 50 units (5000 / 100 = 50). These 50 units are deposited into your demat/mutual fund folio. 
If the market rises next month, and the NAV on February 5th is ₹125, your fixed ₹5,000 will purchase 40 units (5000 / 125 = 40). 
Every single month, on autopilot, you accumulate more and more units. Over a decade, you will assemble a massive stash of mutual fund units without ever having to manually transfer funds or log into a brokerage account. The friction is removed, making wealth creation effortless and automatic.`,
        keyTakeaways: [
          'An SIP is not a product; it is an automated method of investing a fixed sum regularly.',
          'Your fixed SIP amount buys mutual fund "units" based on the Net Asset Value (NAV) of that specific day.',
          'SIPs automate financial discipline by removing the friction of manual investing.'
        ]
      },
      {
        id: 'ch4-2',
        title: 'Chapter 2: Rupee cost averaging — why market crashes are actually good',
        content: `The greatest superpower of an SIP is a mathematical phenomenon called "Rupee Cost Averaging." Human psychology makes us want to buy when the market is rising and panic-sell when the market is crashing. An SIP forces you to do the exact opposite.

Because you invest a FIXED amount of rupees every month, you automatically buy FEWER units when the market is expensive, and MORE units when the market is cheap.

Let’s look at a real-world scenario around the brutal COVID-19 crash in early 2020. 
Imagine a disciplined investor running a ₹5,000 SIP into a Nifty 50 fund.
In January 2020, the market is at an all-time high. The fund NAV is ₹100. Their ₹5,000 buys 50 units.
In March 2020, the pandemic hits. The Nifty crashes by 38%. The NAV collapses to ₹62. The investor is terrified, but they do nothing and let the automated SIP run. That same ₹5,000 auto-debit now purchases 80.6 units! 

Because the market was heavily discounted, their fixed ₹5,000 swept up a massive pile of cheap units. When the market violently recovered over the next 18 months and the NAV crossed ₹150, all 80 of those units bought at the bottom exploded in value. 

Through Rupee Cost Averaging, you don't need to predict market bottoms. By simply keeping your SIP running through a crisis, you automatically accumulate a disproportionate amount of wealth at the lowest possible prices, dragging your average purchase cost down significantly.`,
        keyTakeaways: [
          'Rupee Cost Averaging automatically buys more units when prices fall and fewer when they rise.',
          'Market crashes are highly profitable for active SIP investors because they accumulate units at deep discounts.',
          'Stopping your SIP out of fear during a crash destroys the core mathematical advantage of the system.'
        ]
      },
      {
        id: 'ch4-3',
        title: 'Chapter 3: Real SIP calculation — the actual math',
        content: `To truly appreciate SIPs, you need to see the actual math based on realistic market returns. According to data from the Association of Mutual Funds in India (AMFI), long-term large-cap equity investments in India have historically hovered around a 12% Compound Annual Growth Rate (CAGR). Let’s apply that 12% to regular SIPs.

Scenario 1: You set up an SIP of ₹5,000 per month for 10 years at a 12% return. 
Over 10 years, you will invest a total of ₹6,00,000 from your bank account. 
Due to the compounding returns, your final corpus value will be approximately ₹11.6 Lakhs. Your money nearly doubled on autopilot.

Scenario 2: You increase the SIP to ₹10,000 per month and let it run for 20 years at a 12% return.
Over 20 years, you will invest a total of ₹24,00,000. 
The final corpus? A staggering ₹99.9 Lakhs! Essentially ₹1 Crore. 

Look at the math closely. You put in ₹24 Lakhs of your own money, but you ended up with ₹1 Crore. The market literally handed you ₹76 Lakhs in pure wealth generation. This happened simply by making sure a modest auto-debit fired on the 5th of every month for two decades. 

This is the power of combining the mathematical acceleration of Compounding (Module 3) with the disciplined, market-crash-absorbing mechanics of an SIP.`,
        keyTakeaways: [
          'A simple ₹10,000 monthly SIP over 20 years at historical 12% returns can generate approximately ₹1 Crore.',
          'The majority of a long-term SIP corpus consists of market returns, not your invested capital.',
          'Consistency over decades is the primary requirement for SIP success.'
        ]
      },
      {
        id: 'ch4-4',
        title: 'Chapter 4: SIP vs Lumpsum — when to use which strategy',
        content: `Investors often have a sudden windfall of cash—an annual bonus, selling a property, or receiving an inheritance—and wonder, "Should I invest this all at once (Lumpsum), or break it up into an SIP over the next 12 months?"

The answer depends heavily on market context and human psychology.

Lumpsum investing is statistically superior if you invest at the bottom of a massive market crash. If you had ₹5 Lakhs idle cash in April 2020 after the COVID crash wiped out 38% of the market, dropping the entire ₹5 Lakhs in at once was a genius move. The market was undeniably cheap, and deploying it all immediately captured the explosive V-shaped recovery over the next year.

However, market crashes are rare and unpredictable. Most of the time, markets are hovering near all-time highs. If you deploy a massive lumpsum at an all-time high and the market crashes by 20% the following month, the psychological pain is devastating. 

This is why SIPs (or STPs - Systematic Transfer Plans for lump sums) are heavily recommended for beginners and salary earners. An SIP eliminates the anxiety of "timing the market." If you started an SIP in January 2020 at the absolute market peak right before COVID, you were perfectly fine, because your subsequent SIPs in Feb, March, April, and May bought the dip automatically via Rupee Cost Averaging. 

Rule of thumb: If you earn a monthly salary, just use a monthly SIP. If you receive a huge cash bonus and the market is normal, break it into a 6-month SIP to average out your entry. Only use aggressive lumpsum deployments when blood is in the streets during major macroeconomic panics.`,
        keyTakeaways: [
          'Lumpsum investing is highly effective during deep market crashes when stocks are visibly undervalued.',
          'SIPs protect you psychologically from investing all your money right before a sudden market drop.',
          'For regular monthly income earners, monthly SIPs are the objectively correct default strategy.'
        ]
      },
      {
        id: 'ch4-5',
        title: 'Chapter 5: Choosing a mutual fund for your SIP',
        content: `Now that you want to start an SIP, which mutual fund should you pick from the thousands available in India? For beginners, the answer is incredibly simple: start with a basic Nifty 50 Index Fund. 

A Nifty 50 index fund simply copies the top 50 largest companies in India. It does not hire an expensive "expert" fund manager to pick stocks; it just lets a computer algorithm buy Reliance, HDFC, TCS, Infosys, etc., in their exact market proportions. Because there is no highly-paid manager making guesses, the fees are microscopic. 

This fee is called the Expense Ratio. An actively managed mutual fund might charge an expense ratio of 1.5% every year. A passive Nifty 50 Index Fund (like those offered by UTI, HDFC, or Nippon India) typically charges an expense ratio of around 0.1% to 0.2%. 

Does a 1.3% difference in fees matter? Absolutely. Over a 20-year SIP, that tiny 1.3% fee difference will eat away Lakhs of rupees from your final compounding corpus. 

Furthermore, data from SPIVA (S&P Indices Versus Active) consistently shows that over a 10-year period, the vast majority of highly-paid active fund managers in India fail to beat the simple Nifty 50 index. They charge you 1.5% for worse performance!

To start your wealth journey today: open a demat account (like Zerodha or Groww), search for a "Nifty 50 Direct Plan Index Fund" from a reputable house like UTI or SBI with an expense ratio below 0.2%, and set up a ₹1,000 monthly SIP. You have now taken control of your financial future.`,
        keyTakeaways: [
          'For beginners, a passive Nifty 50 Index Fund is the best starting point for a long-term SIP.',
          'Always choose "Direct Plans" over "Regular Plans" to avoid paying hidden commissions to brokers.',
          'Expense ratios drastically erode long-term compounding; index funds offer the lowest possible fees.'
        ]
      }
    ],
    visualAidType: 'sip-growth',
    keyTakeaways: [
      'SIP automates your investments, removing friction and emotional bias.',
      'Rupee Cost Averaging automatically buys more units during market crashes.',
      'A ₹10k SIP for 20 years at 12% generates roughly ₹1 Crore.',
      'Start with a low-cost Nifty 50 Index Fund.'
    ],
    quiz: [
      {
        id: 'q4-1',
        question: 'Mechanically, what happens on the exact day your SIP auto-debit triggers?',
        chapterId: 'ch4-1',
        type: 'multiple-choice',
        options: [
          'Your fixed amount buys mutual fund units based on that days specific Net Asset Value (NAV)',
          'The mutual fund house sends you physical stock certificates in the mail',
          'Your bank locks your savings account for 24 hours',
          'The government deducts a 10% penalty fee'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 1 explains that the SIP debit buys units based on the end-of-day NAV price of the fund.'
      },
      {
        id: 'q4-2',
        question: 'How does Rupee Cost Averaging benefit an investor during a severe market crash like March 2020?',
        chapterId: 'ch4-2',
        type: 'multiple-choice',
        options: [
          'The fixed SIP amount automatically purchases a significantly higher number of units at deeply discounted prices',
          'It pauses the SIP automatically to prevent losses',
          'It converts all equity units into physical gold',
          'It forces the stock market to immediately recover'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 2 proves that a fixed SIP amount buys more units when prices fall, heavily stacking your portfolio with cheap units.'
      },
      {
        id: 'q4-3',
        question: 'What is the approximate final corpus of a ₹10,000 monthly SIP running for 20 years at a 12% historical return?',
        chapterId: 'ch4-3',
        type: 'multiple-choice',
        options: [
          '₹1 Crore (₹99.9 Lakhs)',
          '₹24 Lakhs',
          '₹40 Lakhs',
          '₹10 Crores'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 3 math shows that ₹24 Lakhs invested over 20 years at 12% explodes to roughly ₹1 Crore.'
      },
      {
        id: 'q4-4',
        question: 'When is Lumpsum investing psychologically and statistically most effective compared to an SIP?',
        chapterId: 'ch4-4',
        type: 'multiple-choice',
        options: [
          'At the very bottom of a massive market panic/crash when stocks are heavily discounted',
          'When the market is hitting new all-time highs every single day',
          'Only when you are purchasing bonds',
          'When you want to avoid paying any taxes'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 4 points out that lumpsum deployments capture the most upside if done during deep market crashes (like April 2020).'
      },
      {
        id: 'q4-5',
        question: 'Why are Nifty 50 Index Funds highly recommended for beginner SIPs over Actively Managed Funds?',
        chapterId: 'ch4-5',
        type: 'multiple-choice',
        options: [
          'They have microscopic Expense Ratios (fees) because they rely on algorithms instead of highly-paid fund managers',
          'They guarantee that you will never lose a single rupee',
          'They are the only funds legally approved by the RBI',
          'They pay out daily cash dividends to your bank'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 5 highlights that passive index funds copy the top 50 companies automatically, resulting in extremely low fees that preserve your compounding wealth.'
      }
    ]
  },
  // 5. DIVERSIFICATION
  {
    id: 'diversification',
    title: 'Diversification: The Only Free Lunch',
    category: 'Risk & Diversification',
    categoryOrder: 5,
    prerequisites: ['what-is-a-stock'],
    estimatedMinutes: 25,
    xpReward: 130,
    summary: 'Don\'t put all your eggs in one basket—learn how spreading investments reduces portfolio volatility.',
    chapters: [
      {
        id: 'ch5-1',
        title: 'Chapter 1: What is diversification and what does it actually do to risk?',
        content: `The oldest rule in investing is "don't put all your eggs in one basket." This is the core concept of diversification, but to be a successful investor, you need to understand the underlying mathematics of why it works.

In finance, there are two types of risk: Systematic Risk and Unsystematic Risk. 
Systematic risk is the risk of the entire economy crashing—like the COVID-19 pandemic or a massive RBI interest rate hike. Diversification across stocks cannot protect you from this, because when the whole market crashes, almost everything goes down.

Unsystematic risk is the danger of a specific company failing. Think of it this way: what if the CEO commits fraud, or a factory burns down? If you hold 100% of your net worth in that one company, your financial life is destroyed. 

Let's look at a real Indian market example. In early 2020, Yes Bank collapsed due to a severe bad loan crisis. The stock crashed by roughly 95%. If an investor had their entire ₹10 Lakh savings exclusively in Yes Bank, they lost almost everything. However, imagine another investor who also had ₹10 Lakhs, but spread it equally across 20 different stocks. Yes Bank made up only 5% of their portfolio (₹50,000). When Yes Bank collapsed to zero, this diversified investor only lost 5% of their total wealth. The growth from their other 19 stocks easily wiped out that loss, allowing them to continue compounding their wealth in peace.`,
        keyTakeaways: [
          'Diversification protects you from Unsystematic Risk (company-specific failure).',
          'It cannot protect you from Systematic Risk (macroeconomic market crashes).',
          'Spreading your capital prevents a single disastrous stock pick from ruining your financial future.'
        ]
      },
      {
        id: 'ch5-2',
        title: 'Chapter 2: Correlation — the concept that makes diversification actually work',
        content: `Simply holding many stocks is not enough. To truly diversify, you must understand 'Correlation'. 

Correlation measures how two assets move in relation to each other. It is measured on a scale from +1 to -1. 
A correlation of +1 means two stocks move perfectly together in the exact same direction. A correlation of -1 means they move perfectly in opposite directions. A correlation of 0 means they have no relationship at all.

Here is a classic trap beginners fall into: They buy Reliance Industries, ONGC, and Coal India, and think they are diversified because they hold three different stocks. But all three of these companies are heavily tied to the energy sector! If global oil prices crash, all three stocks will likely crash at the same time. Their correlation is very high (close to +1). This is NOT real diversification.

Genuine diversification requires buying assets with low or negative correlation. For example, you build a portfolio holding Reliance (Energy), TCS (Information Technology), HDFC Bank (Financials), and Asian Paints (FMCG). 

Why does this work? Because if global crude oil prices shoot up, Asian Paints (which uses oil for paint manufacturing) might see its profit margins shrink, causing its stock to fall. However, Reliance (which extracts and refines oil) will likely see massive profits, causing its stock to rise! By holding completely unrelated businesses, you ensure that a crisis in one sector is often offset by a boom in another, significantly reducing the overall volatility of your portfolio.`,
        keyTakeaways: [
          'Correlation measures how closely two assets move in the same direction.',
          'Buying multiple stocks in the same sector provides very little true diversification.',
          'Hold companies across completely different sectors (e.g., Banking, IT, FMCG) to lower portfolio volatility.'
        ]
      },
      {
        id: 'ch5-3',
        title: 'Chapter 3: Diversifying across asset classes — beyond just picking stocks',
        content: `True wealth preservation goes beyond just picking different stocks. It requires diversifying across completely different Asset Classes. The main asset classes for Indian investors are Equity (stocks), Debt (Bonds/FDs), Gold, and Real Estate. 

Each of these asset classes behaves differently depending on the macroeconomic weather. 

Let's look at the ultimate stress test: the terrifying COVID-19 crash in March 2020. 
During this period, the global economy shut down. The Nifty 50 (Equity) suffered a brutal crash, falling roughly 38% in a matter of weeks. An investor who was 100% in stocks experienced pure panic.

However, consider an investor who had diversified their wealth into three asset classes: 50% Equity, 30% Debt, and 20% Gold.
When the pandemic hit, investors panicked and sought safe havens. They poured money into Gold. As a result, while the stock market was crashing, the price of Gold shot up by roughly 25% over a few months! 
At the same time, the RBI aggressively cut interest rates to save the economy. As you learned in Module 2, when interest rates fall, bond prices rise. Therefore, long-duration Debt funds also delivered positive, stable returns during the crash.

The investor who held all three asset classes saw their Gold and Debt holdings aggressively cushion the blow of their collapsing Equity holdings. Their overall portfolio dropped much less than 38%, giving them the psychological safety and confidence to stay invested rather than panic-selling at the bottom.`,
        keyTakeaways: [
          'True diversification requires holding different asset classes (Equity, Debt, Gold).',
          'Asset classes react differently to economic crises—Gold often rises when Equities fall.',
          'Multi-asset portfolios suffer much smaller drawdowns during severe market panics.'
        ]
      },
      {
        id: 'ch5-4',
        title: 'Chapter 4: The mathematics of diversification — why 2 risky assets create a safe portfolio',
        content: `You might be wondering: "If I combine two risky, volatile assets, shouldn't my total risk increase?" 

Surprisingly, the answer is no. This is the mathematical magic of diversification. According to Modern Portfolio Theory, you can actually lower your total portfolio risk (variance) simply by combining assets that don't move in tandem.

Let's use a simple, intuitive example. Imagine an island with two companies. Company A sells Sunglasses, and Company B sells Umbrellas. 
Both companies are highly risky and volatile because their profits depend entirely on the weather. If it rains all summer, the Sunglasses company goes bankrupt. If it’s sunny all year, the Umbrella company goes bankrupt.

However, what if you buy exactly 50% of Company A and 50% of Company B? 
Their correlation is exactly -1 (they move perfectly opposite to each other). If it's a sunny year, your Sunglasses stock booms, offsetting your Umbrella stock losses. If it rains, your Umbrella stock booms, offsetting your Sunglasses losses. 

By combining two incredibly risky assets, you have mathematically created a portfolio with almost zero risk! You will make a steady, guaranteed profit regardless of the weather. 

While perfect -1 correlation doesn't exist in the real stock market, finding assets with a correlation of 0 (they move independently, like Gold and Stocks) still mathematically reduces your portfolio's standard deviation (risk) without sacrificing the average expected return.`,
        keyTakeaways: [
          'Combining two volatile assets can mathematically reduce overall risk if their correlation is low.',
          'Assets with a correlation of -1 move in opposite directions, acting as a perfect hedge.',
          'Diversification is considered the "only free lunch" in finance because it lowers risk without destroying returns.'
        ]
      },
      {
        id: 'ch5-5',
        title: 'Chapter 5: Over-diversification — when too much of a good thing hurts you',
        content: `If holding 20 stocks is safer than holding 1, shouldn't holding 200 stocks be even better? 

No. This is called 'Over-diversification', and it is a massive trap for beginner investors. Mathematics shows that the benefits of risk reduction heavily diminish after you hold about 25 to 30 uncorrelated stocks. Going from 1 stock to 10 stocks dramatically reduces your risk. Going from 30 stocks to 100 stocks barely reduces your risk at all, but it heavily destroys your potential returns.

The problem with over-diversification is that your portfolio simply regresses to the market average. If you buy 150 random stocks, you have essentially just manually built a very expensive index fund. Furthermore, it is humanly impossible to track the quarterly earnings, management changes, and business health of 150 different companies. 

Let's look at mutual funds. An actively managed mutual fund holding 150 stocks will almost never beat the Nifty 50, because their great stock picks are diluted by 130 mediocre stock picks. On the other hand, a concentrated fund holding 25 strictly selected, high-conviction companies has a much better chance of outperforming the broader market. 

To build wealth effectively, find the sweet spot. Hold enough companies (around 15 to 25) across different sectors to eliminate the risk of a single company failing, but keep it concentrated enough so that when one of your picks doubles in value, it actually has a meaningful, visible impact on your total wealth.`,
        keyTakeaways: [
          'Risk reduction benefits drop off sharply after holding 25 to 30 uncorrelated stocks.',
          'Holding too many stocks dilutes your best ideas and guarantees average, index-like returns.',
          'Aim for the sweet spot: enough stocks to avoid single-company disaster, but concentrated enough to allow for massive outperformance.'
        ]
      }
    ],
    visualAidType: 'diversification-pie',
    keyTakeaways: [
      'Diversification eliminates company-specific risk but cannot prevent macro market crashes.',
      'Invest across different sectors to ensure low correlation between your stocks.',
      'Hold different asset classes (Equity, Debt, Gold) to survive severe economic stress.',
      'Avoid over-diversification; holding more than 30 stocks dilutes your returns.'
    ],
    quiz: [
      {
        id: 'q5-1',
        question: 'Which type of risk can diversification successfully eliminate?',
        chapterId: 'ch5-1',
        type: 'multiple-choice',
        options: [
          'Unsystematic Risk (e.g., a specific company going bankrupt)',
          'Systematic Risk (e.g., a global pandemic)',
          'Inflation Risk (e.g., rising cost of groceries)',
          'Liquidity Risk'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 1 explains that spreading capital across 20 stocks prevents the failure of a single company (unsystematic risk) from destroying your portfolio.'
      },
      {
        id: 'q5-2',
        question: 'Why is buying Reliance, ONGC, and Coal India together considered poor diversification?',
        chapterId: 'ch5-2',
        type: 'multiple-choice',
        options: [
          'Because they are all in the energy sector and have highly correlated stock prices',
          'Because they are all penny stocks',
          'Because the RBI banned holding three stocks at once',
          'Because none of them pay dividends'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 2 warns that buying stocks in the exact same sector provides high correlation, meaning they will all crash together if the sector faces a crisis.'
      },
      {
        id: 'q5-3',
        question: 'During the March 2020 stock market crash, how did Gold react?',
        chapterId: 'ch5-3',
        type: 'multiple-choice',
        options: [
          'It rose significantly as investors sought a safe haven',
          'It crashed exactly 38% alongside the Nifty 50',
          'The government halted all gold trading',
          'It remained perfectly flat at 0% return'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 3 highlights that Gold is a non-correlated asset class that often shoots up during equity market panics.'
      },
      {
        id: 'q5-4',
        question: 'In the Umbrella and Sunglasses company example, what is the mathematical correlation between the two businesses?',
        chapterId: 'ch5-4',
        type: 'multiple-choice',
        options: [
          '-1 (They move in perfectly opposite directions based on the weather)',
          '+1 (They move exactly together)',
          '0 (They have absolutely no relationship)',
          '+5 (They multiply each others profits)'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 4 uses this intuitive example to explain a -1 correlation, demonstrating how combining two volatile assets can result in a zero-risk portfolio.'
      },
      {
        id: 'q5-5',
        question: 'What is the primary danger of over-diversification (e.g., holding 150 different stocks)?',
        chapterId: 'ch5-5',
        type: 'multiple-choice',
        options: [
          'It dilutes your best stock picks, heavily dragging your returns down to the market average',
          'It drastically increases your risk of bankruptcy',
          'The stock broker will charge you a massive penalty fee',
          'It forces you to pay higher capital gains taxes'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 5 explains that holding too many stocks destroys your ability to outperform, essentially turning your portfolio into a diluted, unmanageable index fund.'
      }
    ]
  },

  // 6. RISK VS RETURN
  {
    id: 'risk-vs-return',
    title: 'Risk vs. Return Tradeoff',
    category: 'Risk & Diversification',
    categoryOrder: 6,
    prerequisites: ['diversification'],
    estimatedMinutes: 25,
    xpReward: 120,
    summary: 'Master the fundamental economic rule: higher potential returns come with higher potential risk.',
    chapters: [
      {
        id: 'ch6-1',
        title: 'Chapter 1: What does "risk" actually mean in investing?',
        content: `When beginners hear the word "risk," they immediately think of "losing all my money in a scam." In professional finance, risk has a completely different meaning. Risk is defined as 'volatility' and the 'uncertainty of outcomes.' It is mathematically measured as the standard deviation of your returns.

Let's distinguish between certainty and risk using a real Indian example. 
If you place ₹1 Lakh in an SBI Fixed Deposit at 6.5%, you have near-zero risk. Why? Because the outcome is perfectly certain. One year from now, you know exactly what your balance will be. The line goes straight up.

Now look at the Nifty 50 Index. Historically, it has delivered an average Compound Annual Growth Rate (CAGR) of about 12%. However, the journey to that 12% average is violently unpredictable. In 2020, the Nifty 50 crashed by 38% in a month due to COVID. The very next year, in 2021, it rallied an astonishing 70%! 

That wild swing—from down 38% to up 70%—is the exact definition of financial risk. You have no idea what the exact return will be in any given 12-month window. When you invest in equities, you are accepting massive year-to-year volatility and uncertainty in exchange for a much higher long-term average return.`,
        keyTakeaways: [
          'In finance, risk means volatility and uncertainty of returns, not necessarily fraud.',
          'Fixed Deposits offer low risk because the outcome is guaranteed and perfectly predictable.',
          'Equities offer high expected returns, but force you to endure massive, unpredictable price swings.'
        ]
      },
      {
        id: 'ch6-2',
        title: 'Chapter 2: The risk-return tradeoff — the fundamental law of investing',
        content: `There is a gravitational law in economics that cannot be broken: Higher expected returns always demand higher risk. 

To understand this, let's look at the "Efficient Frontier" in the real Indian market. We can map out a ladder of asset classes.
1. The Savings Account (3.5% return): Ultra-safe, insured by the RBI. Zero volatility.
2. The Fixed Deposit (6.5% to 7% return): Very safe, but your money is locked for a set time.
3. Government Securities / G-Secs (7% to 7.5% return): Safe sovereign debt, but the bond price will fluctuate slightly if RBI rates change.
4. Nifty 50 Large Cap Stocks (12% average return): High returns, but your portfolio can temporarily lose 30% of its value during global panics.
5. Small Cap Stocks (15%+ potential return): Massive growth potential, but during a recession, small businesses get wiped out, and the index can crash 60%.
6. Crypto Tokens (Unknown return): Pure speculation. You might make 500% in a month, or the asset might mathematically go to zero the next day.

Notice the pattern? If you want to move up the ladder from 7% to 12% to 15%, the market forces you to pay a price. That price is stomach-churning volatility. You are literally being compensated (paid a higher return) for your willingness to take on anxiety and uncertainty. If an asset offered 15% guaranteed returns with zero risk, every bank in the world would pour trillions into it instantly, driving the return back down to 7%.`,
        keyTakeaways: [
          'Higher expected returns always come with higher risk; there are absolutely no exceptions.',
          'The risk ladder scales from safe Savings Accounts up to highly volatile Small Cap stocks.',
          'Returns are simply the financial compensation you receive for enduring volatility and uncertainty.'
        ]
      },
      {
        id: 'ch6-3',
        title: 'Chapter 3: Measuring risk — standard deviation and beta explained',
        content: `How do professionals actually put a number on risk? They use two main metrics: Standard Deviation and Beta.

Standard Deviation measures how wildly an asset's returns bounce around its historical average. If a mutual fund has a historical average return of 12% but a massive standard deviation, it means in any given year, the return might be +40% or -20%. It is a rollercoaster. A fund with a low standard deviation might give you a boring, predictable +10% to +14% every year.

Beta is slightly different—it measures how volatile a specific stock is compared to the overall Nifty 50 index. The Nifty 50 is assigned a Beta of exactly 1.0. 
- If a stock has a Beta of 1.5, it is 50% more volatile than the market. If the Nifty goes up 10%, this stock typically goes up 15%. If the Nifty crashes 10%, this stock crashes 15%.
- If a stock has a Beta of 0.5, it is half as volatile as the market.

Let's look at a real example. HDFC Bank is a massive, incredibly stable institution. Its Beta is often close to 1.0 or slightly below. It moves steadily with the broader economy. 
Now look at Adani Enterprises, an aggressively expanding conglomerate. Its Beta is frequently well above 1.5. During a bull market, it explodes upwards far faster than the Nifty. But during a negative news cycle (like a short-seller report), it crashes violently, far worse than the broader market. Understanding Beta helps you predict how violently your portfolio will react to market news.`,
        keyTakeaways: [
          'Standard deviation measures how wildly an asset’s actual returns deviate from its long-term average.',
          'Beta measures a stock’s volatility relative to the overall market index.',
          'A Beta greater than 1 means the stock will suffer amplified losses during market crashes.'
        ]
      },
      {
        id: 'ch6-4',
        title: 'Chapter 4: Risk profiling — knowing your own tolerance',
        content: `Before you construct a portfolio, you must determine your personal Risk Profile. This is not just a psychological test of how brave you feel; it is a mathematical assessment based on three strict factors: Time Horizon, Financial Obligations, and Emotional Temperament.

Let's look at a real scenario contrasting two different investors.

Investor A is a 22-year-old software engineer. He is unmarried, has zero debt, and earns a great salary. Most importantly, he does not plan to touch his invested money until retirement at age 60. He has a massive 38-year Time Horizon. His risk profile is 'Aggressive'. If the stock market crashes 40% tomorrow, it literally does not matter to him. He doesn't need the cash, and he has decades to wait for the recovery.

Investor B is a 45-year-old father with a home loan, aging parents with medical bills, and a daughter entering college in exactly 3 years. His Time Horizon for his daughter's education fund is painfully short (3 years). His risk profile must be 'Conservative'. If he puts that education money into small-cap stocks and the market crashes 40% tomorrow, he cannot pay the college tuition. The real-life consequences are devastating.

Emotional temperament also matters. If Investor A (the 22-year-old) is going to panic and sell all his stocks at a massive loss the moment the news gets scary, then his psychological risk tolerance is low, and he should not be holding an aggressive portfolio despite his long time horizon. You must match your investments to both your timeline and your heart rate.`,
        keyTakeaways: [
          'Risk profiling is determined by Time Horizon, Financial Obligations, and Emotional Temperament.',
          'A longer time horizon drastically increases your mathematical ability to take on equity risk.',
          'Money needed in the short term (under 3 years) must never be exposed to the stock market.'
        ]
      },
      {
        id: 'ch6-5',
        title: 'Chapter 5: Building a portfolio that matches your risk profile',
        content: `Once you know your profile, you construct a portfolio by allocating percentages to different asset classes. Let's look at three standard templates and how to deploy ₹5 Lakhs into actual Indian instruments.

1. The Conservative Portfolio (Low Risk)
Target: Protect capital, beat inflation slightly.
Allocation: 20% Equity, 60% Debt, 20% Gold.
Deploying ₹5 Lakhs:
- ₹1 Lakh into a stable large-cap fund (e.g., UTI Nifty 50 Index Fund).
- ₹3 Lakhs into ultra-safe debt (e.g., SBI Magnum Gilt Fund or direct RBI G-Secs).
- ₹1 Lakh into a Gold ETF (e.g., Nippon India Gold BEES).
Result: Massive safety. A 30% stock market crash only drops the total portfolio value by 6%, which the debt interest easily covers.

2. The Moderate Portfolio (Balanced Risk)
Target: Solid growth with moderate shock absorbers.
Allocation: 50% Equity, 35% Debt, 15% Gold.
Deploying ₹5 Lakhs:
- ₹2.5 Lakhs across Nifty 50 and Nifty Next 50 index funds.
- ₹1.75 Lakhs into corporate bond funds or FDs for stability.
- ₹75,000 into Gold ETFs for crisis hedging.
Result: A smooth ride that outpaces inflation heavily but avoids the terrifying drawdowns of an all-equity portfolio.

3. The Aggressive Portfolio (High Risk)
Target: Maximum long-term wealth creation.
Allocation: 80% Equity, 10% Debt, 10% Gold.
Deploying ₹5 Lakhs:
- ₹4 Lakhs heavily tilted into Equities (Nifty 50, Mid-cap funds, and select small-caps).
- ₹50,000 in liquid debt funds (purely as emergency cash).
- ₹50,000 in Gold.
Result: High volatility. The investor must be psychologically prepared to watch their ₹5 Lakhs temporarily drop to ₹3.5 Lakhs during a recession, trusting the long-term compounding engine.`,
        keyTakeaways: [
          'Conservative portfolios heavily utilize Debt (60%+) to anchor the portfolio and prevent losses.',
          'Aggressive portfolios are dominated by Equity (80%+) to maximize long-term exponential growth.',
          'Always keep a small allocation to Debt and Gold to act as shock absorbers during severe panics.'
        ]
      }
    ],
    visualAidType: 'risk-return-scatter',
    keyTakeaways: [
      'Risk is defined as the volatility and unpredictability of your returns.',
      'To earn higher returns, you must accept higher risk.',
      'Beta measures how violently a stock moves compared to the Nifty 50.',
      'Your Time Horizon determines your capacity to take on risk.'
    ],
    quiz: [
      {
        id: 'q6-1',
        question: 'In professional finance, how is "Risk" accurately defined?',
        chapterId: 'ch6-1',
        type: 'multiple-choice',
        options: [
          'The volatility, uncertainty, and standard deviation of your returns',
          'The probability that the broker will steal your money',
          'Paying taxes on your dividends',
          'Investing in government bonds'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 1 clearly defines risk as the unpredictable volatility of returns, contrasting the certainty of an FD with the swings of the Nifty 50.'
      },
      {
        id: 'q6-2',
        question: 'According to the risk-return tradeoff, what happens if you move your money from a safe 7% G-Sec to a high-growth Small Cap stock?',
        chapterId: 'ch6-2',
        type: 'multiple-choice',
        options: [
          'You drastically increase your potential return, but also accept massive short-term price volatility',
          'You increase your return and completely eliminate all risk',
          'Your returns will drop to 3.5%',
          'The government guarantees your small-cap investments'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 2 dictates that climbing the risk ladder for higher returns inherently requires accepting higher volatility and uncertainty.'
      },
      {
        id: 'q6-3',
        question: 'If the Nifty 50 has a Beta of 1.0, what does it mean if Adani Enterprises has a Beta of 1.5?',
        chapterId: 'ch6-3',
        type: 'multiple-choice',
        options: [
          'It is 50% more volatile than the broader market index',
          'It pays 50% more dividends',
          'It is completely immune to market crashes',
          'It is half as risky as HDFC Bank'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 3 explains that a Beta > 1 signifies that the stock moves more aggressively (both up and down) than the benchmark index.'
      },
      {
        id: 'q6-4',
        question: 'Why must the 45-year-old father adopt a Conservative risk profile for his daughters college fund?',
        chapterId: 'ch6-4',
        type: 'multiple-choice',
        options: [
          'Because his Time Horizon is incredibly short (3 years), making stock market volatility too dangerous',
          'Because older people are not legally allowed to buy equity',
          'Because college tuition must be paid in gold coins',
          'Because he has a 38-year runway to compound'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 4 stresses that a short Time Horizon eliminates your capacity to absorb market crashes, requiring a safe, conservative profile.'
      },
      {
        id: 'q6-5',
        question: 'In the Conservative Portfolio template, which asset class holds the massive 60% majority of the capital?',
        chapterId: 'ch6-5',
        type: 'multiple-choice',
        options: [
          'Debt (Bonds/FDs/G-Secs)',
          'Small-cap Equity',
          'Crypto Tokens',
          'Real Estate'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 5 shows that a conservative portfolio anchors 60% of its weight in safe Debt instruments to prevent capital loss.'
      }
    ]
  },

  // 7. MARKET ORDERS VS LIMIT ORDERS
  {
    id: 'market-vs-limit-orders',
    title: 'Market vs. Limit Orders',
    category: 'Instruments',
    categoryOrder: 7,
    prerequisites: ['what-is-a-stock'],
    estimatedMinutes: 25,
    xpReward: 110,
    summary: 'Master execution mechanics: learn exactly how to control your entry prices and prevent slippage.',
    chapters: [
      {
        id: 'ch7-1',
        title: 'Chapter 1: What actually happens when you click "Buy" on Zerodha?',
        content: `When you look at a stock chart on Zerodha Kite and click the bright blue "Buy" button, a complex technological journey happens in milliseconds. 

First, your order is sent from your mobile app to your Broker (Zerodha). The broker verifies that you have enough cash in your account. 
Second, the broker routes your order over high-speed internet lines directly to the Exchange (the National Stock Exchange - NSE, or the BSE). 
Third, the Exchange's matching engine looks at the massive digital order book. This book contains thousands of buyers (bidding for a low price) and thousands of sellers (asking for a high price). 

The exchange acts as the ultimate matchmaker. If your order matches the price of a willing seller, the trade is instantly executed. Finally, the Clearing Corporation steps in behind the scenes to ensure the seller actually delivers the shares to your Demat account, and the cash is deducted from your bank.

Understanding this plumbing is critical because the exact type of order you send to that matching engine determines how much money you pay, and whether you get the shares at all. The two most important tools in your arsenal are Market Orders and Limit Orders.`,
        keyTakeaways: [
          'Your broker (Zerodha) simply routes your request; the Exchange (NSE/BSE) actually matches buyers and sellers.',
          'The order book is a massive digital ledger of everyone trying to buy and sell at various prices.',
          'The specific order type you choose dictates exactly how the matching engine treats your trade.'
        ]
      },
      {
        id: 'ch7-2',
        title: 'Chapter 2: Market orders — speed at the cost of price certainty',
        content: `A Market Order is the simplest instruction you can give the exchange. You are essentially screaming, "I want to buy 100 shares right now, and I will accept literally whatever the lowest available price is!"

Market orders prioritize SPEED over PRICE. You are guaranteed to get the shares instantly, but you are not guaranteed the exact price you saw on your screen.

When is a market order the right choice? It is perfect for highly liquid, massive companies. If you place a market order for Reliance Industries or a Nifty 50 Index ETF, there are millions of buyers and sellers actively trading every second. The gap between the buyers and sellers is microscopic (often just ₹0.05). If the screen says ₹2,800, your market order will likely fill at exactly ₹2,800 or ₹2,800.05.

When is a market order extremely dangerous? When trading illiquid, small-cap stocks. Imagine a tiny chemical company where very few people are trading. The last traded price on the screen says ₹450. You confidently place a Market Order for 500 shares.
However, because it's illiquid, the closest willing seller in the order book is actually demanding ₹467! Because you told the exchange "give me any price available," the engine instantly executes your trade at ₹467. 
This hidden penalty is called "Slippage." You just lost thousands of rupees to slippage because you prioritized speed over price control on a volatile asset.`,
        keyTakeaways: [
          'Market orders prioritize absolute speed and guarantee execution, but sacrifice price control.',
          'Market orders are perfectly safe for highly liquid blue-chip stocks like Reliance or TCS.',
          'Never use market orders on illiquid small-cap stocks, as massive slippage can destroy your capital.'
        ]
      },
      {
        id: 'ch7-3',
        title: 'Chapter 3: Limit orders — taking absolute control of your entry price',
        content: `A Limit Order is the exact opposite of a Market Order. You are sending a strict instruction to the exchange: "I want to buy 100 shares, but I refuse to pay a single paisa more than ₹X."

Limit orders prioritize PRICE CONTROL over SPEED. You are guaranteed the exact price you want, but you are NOT guaranteed that the trade will actually execute.

Let’s look at a real example. TCS is currently trading at ₹3,800. However, today is their quarterly earnings report day, and the stock is bouncing around violently. You want to buy, but you are afraid of getting hit by slippage if you use a Market Order. 
Instead, you place a Limit Buy Order at exactly ₹3,750.

What happens next? Your order goes into the NSE order book and waits. 
Scenario A: The market dips, TCS hits ₹3,750, and a seller matches your price. Your trade executes beautifully, and you secured your exact desired entry.
Scenario B: The market rallies, TCS shoots up to ₹3,900, and never touches ₹3,750. Your limit order sits in the order book untouched until the market closes at 3:30 PM, at which point it is automatically cancelled. You missed the trade entirely.

This is the tradeoff. Limit orders protect you from violent price spikes and eliminate slippage completely, but you must accept the risk that the market might run away without you.`,
        keyTakeaways: [
          'Limit orders guarantee you will never pay more than your specified maximum price.',
          'The tradeoff is execution risk: if the stock never hits your limit price, you do not get the shares.',
          'Limit orders are essential for volatile earnings days and illiquid stocks.'
        ]
      },
      {
        id: 'ch7-4',
        title: 'Chapter 4: Stop-loss orders — your financial safety net',
        content: `A Stop-Loss order is the ultimate risk management tool. While limit orders control how you enter a trade, stop-loss orders control how you exit a losing trade before it becomes a catastrophe.

A Stop-Loss is an automated trigger. Let’s say you buy shares of Infosys at ₹1,500. You analyze the chart and decide that if the stock falls below ₹1,425 (a 5% loss), you want to cut your losses and exit immediately to protect your remaining capital. You place a Stop-Loss Market order at ₹1,425.

Two days later, Infosys unexpectedly announces terrible earnings results while you are busy in a meeting at work. The stock begins to crash violently. 
As it crosses the ₹1,425 threshold, the NSE matching engine automatically triggers your Stop-Loss. It converts it into a Market Sell Order, dumping your shares instantly. You take a managed 5% loss.

What happens to the trader who didn't use a stop-loss? They check their phone after their meeting and see that Infosys has gapped down to ₹1,200. They are trapped in a massive 20% drawdown, paralyzing their portfolio for months.

There is one critical distinction to learn: Stop-Loss Market vs Stop-Loss Limit. 
A Stop-Loss Market triggers and dumps the shares at whatever the lowest price is. During a violent crash, it might trigger at ₹1,425 but execute at ₹1,410 due to slippage. 
A Stop-Loss Limit triggers and places a strict limit sell. However, during a violent crash, the price might fall so fast that it skips right past your limit price without executing, leaving you holding the crashing stock! Therefore, for true emergency exits, Stop-Loss Market is generally preferred.`,
        keyTakeaways: [
          'Stop-Loss orders act as an automated emergency exit to cut your losses at a predefined level.',
          'They prevent small, manageable losses from spiraling into portfolio-destroying catastrophes.',
          'Stop-Loss Market guarantees you exit the position, whereas Stop-Loss Limit carries the risk of being skipped during violent crashes.'
        ]
      },
      {
        id: 'ch7-5',
        title: 'Chapter 5: Choosing the right order type — a practical decision framework',
        content: `Let's synthesize everything into a practical decision framework for active trading in the Indian market.

Scenario 1: You are starting your monthly SIP into a Nifty 50 ETF. 
Decision: Use a Market Order. The instrument is hyper-liquid, the spread is 0.01%, and your priority is simply to accumulate the units quickly.

Scenario 2: It is Budget Day. The Finance Minister is giving a live speech, and the entire IT sector (including massive stocks like TCS) is wildly swinging up and down 2% every five minutes based on her comments. You want to buy TCS.
Decision: Use a Limit Order. Because the volatility is extreme, a market order could trigger right at the peak of a 30-second price spike, handing you terrible slippage. Set a strict Limit Buy and let the volatile price come to you.

Scenario 3: You are trading a small-cap textile stock you found. The daily volume is very low.
Decision: Always use a Limit Order. Illiquid stocks have dangerous bid-ask spreads. Never give the exchange a blank check to buy at any price.

Scenario 4: You bought Tata Motors for a short-term swing trade. A global auto-manufacturing crisis hits the news, the Nifty Auto index is collapsing, and your position is deep in the red. You need to get out to save your capital.
Decision: Use a Market Order (or a Stop-Loss Market order). In a crisis, your absolute priority is SPEED. You must exit the burning building immediately. Trying to save ₹2 using a Limit order might result in the stock crashing another ₹50 while your limit order sits unfilled.

By matching the order type to the market environment, you elevate yourself from a beginner to a tactical trader.`,
        keyTakeaways: [
          'Use Market Orders for highly liquid assets and emergency exits where speed is critical.',
          'Use Limit Orders for volatile days, illiquid stocks, and precision entries to avoid slippage.',
          'Always use Stop-Loss orders to automate your risk management and protect your capital.'
        ]
      }
    ],
    visualAidType: 'order-book-visualizer',
    keyTakeaways: [
      'Market orders prioritize speed over price; Limit orders prioritize price over speed.',
      'Slippage occurs when market orders execute at unfavorable prices in illiquid stocks.',
      'Stop-loss orders are mandatory tools to cut losses before they become catastrophic.',
      'Always use limit orders on volatile earnings days to avoid price spikes.'
    ],
    quiz: [
      {
        id: 'q7-1',
        question: 'What is the primary tradeoff when using a Market Order?',
        chapterId: 'ch7-2',
        type: 'multiple-choice',
        options: [
          'You guarantee execution speed, but lose control over the exact fill price',
          'You guarantee the exact price, but the trade might take 3 days to execute',
          'You are forced to pay double brokerage fees',
          'You can only buy 1 share at a time'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 2 emphasizes that market orders prioritize absolute speed (guaranteed execution) over price certainty.'
      },
      {
        id: 'q7-2',
        question: 'Why is using a Market Order on an illiquid small-cap stock extremely dangerous?',
        chapterId: 'ch7-2',
        type: 'multiple-choice',
        options: [
          'Because the wide bid-ask spread can cause massive slippage, executing your trade at a terrible price',
          'Because the NSE bans small-cap stocks',
          'Because illiquid stocks immediately go bankrupt',
          'Because small-cap stocks cannot be sold for 10 years'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 2 warns that the lack of willing buyers/sellers in illiquid stocks causes market orders to suffer devastating slippage.'
      },
      {
        id: 'q7-3',
        question: 'What happens if you place a Limit Buy order at ₹3,750, but the stock never drops below ₹3,800 that day?',
        chapterId: 'ch7-3',
        type: 'multiple-choice',
        options: [
          'The order sits unfilled in the order book and is automatically cancelled at market close',
          'The broker automatically changes it to a market order at 3:15 PM',
          'You are charged a heavy penalty fee by the exchange',
          'The stock price is forcefully lowered by the RBI'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 3 explains execution risk: if your strict limit price is not met, the trade simply does not happen and expires at the end of the day.'
      },
      {
        id: 'q7-4',
        question: 'What is the main danger of using a Stop-Loss Limit order instead of a Stop-Loss Market order during a violent crash?',
        chapterId: 'ch7-4',
        type: 'multiple-choice',
        options: [
          'The plunging price might skip past your exact limit price, leaving your order unfilled while the stock continues to crash',
          'It automatically buys more shares of the crashing stock',
          'It alerts other traders to short-sell your stock',
          'It converts your equity into government bonds'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 4 points out that strict limit prices can be skipped during violent, high-speed selloffs, trapping you in the sinking stock.'
      },
      {
        id: 'q7-5',
        question: 'If it is Budget Day and the market is swinging violently up and down every few minutes, which order type should you use to enter a trade?',
        chapterId: 'ch7-5',
        type: 'multiple-choice',
        options: [
          'Limit Order (to strictly control your entry price and avoid a volatility spike)',
          'Market Order (to get in as fast as possible)',
          'Stop-Loss Order',
          'Delivery Order'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 5 dictates that during extreme volatility (like Budget Day), limit orders protect you from getting filled at the top of an accidental price spike.'
      }
    ]
  },

  // 8. PE RATIO BASICS
  {
    id: 'pe-ratio-basics',
    title: 'P/E Ratio Basics & Valuation',
    category: 'Instruments',
    categoryOrder: 8,
    prerequisites: ['what-is-a-stock'],
    estimatedMinutes: 6,
    xpReward: 130,
    summary: 'Learn how to read Price-to-Earnings ratios to judge if a stock is overvalued or bargain-priced.',
    chapters: [
      {
        id: 'ch8-1',
        title: 'Chapter 1: Price per Rupee of Profit',
        content: 'The Price-to-Earnings (P/E) Ratio measures how much investors are paying for ₹1 of annual company earnings.,\\n\\nFormula: P/E Ratio = Stock Price ÷ Earnings Per Share (EPS).',
        example: 'If TCS stock price is ₹4,000 and its annual EPS is ₹100, its P/E ratio is ₹4,000 ÷ ₹100 = 40x. Investors pay ₹40 for every ₹1 of profit TCS generates.',
        keyPoint: 'P/E ratio evaluates valuation relative to underlying corporate earnings.'
      },
      {
        id: 'ch8-2',
        title: 'Chapter 2: High P/E vs Low P/E Stocks',
        content: '1. High P/E (>35x): Indicates investors expect rapid future earnings growth or that the stock is currently expensive.\n2. Low P/E (<15x): Indicates a mature value stock, slow growth, or potential market skepticism.',
        example: 'Tech stars like Tata Elxsi trade at high P/E ratios due to AI growth expectations, whereas PSU banks like SBIN trade at lower P/E ratios.',
        keyPoint: 'A high P/E implies high growth expectations; a low P/E implies value status or slow growth.'
      },
      {
        id: 'ch8-3',
        title: 'Chapter 3: Sector Comparison Context',
        content: 'Never compare P/E ratios across different industries! A software company P/E (30x) cannot be directly compared to a steel company P/E (10x). Always compare a company\'s P/E against its direct industry peers and historical average.',
        example: 'Compare Infosys P/E (27x) against TCS P/E (32x) and Wipro P/E (22x) in the IT sector.',
        keyPoint: 'Always evaluate P/E ratios against direct competitors in the same sector.'
      }
    ],
    visualAidType: 'pe-ratio-comparator',
    keyTakeaways: [
      'P/E ratio = Stock Price ÷ Earnings Per Share (EPS).',
      'High P/E signals high growth expectations; low P/E signals value status.',
      'Always compare P/E against competitors in the exact same sector.'
    ],
    quiz: [
      {
        id: 'q8-1',
        question: 'If a company stock price is ₹1,000 and its Earnings Per Share (EPS) is ₹50, what is its P/E ratio?',
        chapterId: 'ch8-1',
        type: 'multiple-choice',
        options: ['20x', '50x', '1000x', '5x'],
        correctAnswer: 0,
        explanation: 'P/E Ratio = Price (₹1,000) ÷ EPS (₹50) = 20x.'
      },
      {
        id: 'q8-2',
        question: 'When evaluating P/E ratios, what is the best baseline comparison?',
        chapterId: 'ch8-3',
        type: 'multiple-choice',
        options: [
          'Other competitor companies in the exact same industry/sector',
          'The total national highway length',
          'The founder\'s age',
          'Gold spot prices'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 3 emphasizes comparing P/E ratios across direct industry peers.'
      }
    ]
  },

  // 9. MARKET VS LIMIT ORDERS
  {
    id: 'market-vs-limit-orders',
    title: 'Market Orders vs. Limit Orders',
    category: 'Trading Mechanics',
    categoryOrder: 9,
    prerequisites: ['index-funds-and-etfs'],
    estimatedMinutes: 6,
    xpReward: 140,
    summary: 'Master execution mechanics: choosing instant speed vs precise price control.',
    chapters: [
      {
        id: 'ch9-1',
        title: 'Chapter 1: Market Orders (Instant Speed)',
        content: 'A Market Order instructs the broker to buy or sell immediately at the current best available market price. It guarantees instant execution speed, but does not guarantee an exact price if market prices move fast.',
        example: 'Placing a Market BUY order for 10 shares of Reliance fills instantly at the current ask price (₹2,985.40).',
        keyPoint: 'Market orders prioritize execution speed over exact price control.'
      },
      {
        id: 'ch9-2',
        title: 'Chapter 2: Limit Orders (Price Precision)',
        content: 'A Limit Order sets a specific target price threshold. A Limit BUY order fills ONLY at your specified limit price or lower. A Limit SELL order fills ONLY at your limit price or higher.',
        example: 'Reliance is trading at ₹2,985. You place a Limit BUY at ₹2,950. The order remains open and fills ONLY if Reliance price dips to ₹2,950 or below.',
        keyPoint: 'Limit orders prioritize price control over instant execution speed.'
      },
      {
        id: 'ch9-3',
        title: 'Chapter 3: Execution Risk & Volatility Strategy',
        content: 'The risk of a Limit Order is that if market prices never reach your target limit price, your order remains pending and unfilled. Use Limit Orders when trading volatile stocks or during market opening price gaps.',
        example: 'Setting a Limit Buy during earnings announcements protects you from unexpected price spikes.',
        keyPoint: 'Use Market orders for fast liquid execution; use Limit orders for price discipline.'
      }
    ],
    visualAidType: 'order-book-visualizer',
    keyTakeaways: [
      'Market orders execute instantly at current available market price.',
      'Limit orders execute only at your target price or better.',
      'Limit orders protect against unexpected price slippage in volatile markets.'
    ],
    quiz: [
      {
        id: 'q9-1',
        question: 'Which order type guarantees immediate execution speed at current market prices?',
        chapterId: 'ch9-1',
        type: 'multiple-choice',
        options: ['Market Order', 'Limit Order', 'Stop-Loss Order', 'Trailing Order'],
        correctAnswer: 0,
        explanation: 'Chapter 1 explains that Market orders prioritize instant execution speed.'
      },
      {
        id: 'q9-2',
        question: 'If TCS is trading at ₹4,210 and you set a Buy Limit Order at ₹4,150, when will it execute?',
        chapterId: 'ch9-2',
        type: 'multiple-choice',
        options: [
          'Only if TCS price drops to ₹4,150 or lower',
          'Immediately at ₹4,210',
          'At market close regardless of price',
          'Never; buy limit orders must be higher than current price'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 2 clarifies that a Buy Limit order executes only when market price reaches target limit or lower.'
      }
    ]
  },

  // 10. BID ASK SPREAD
  {
    id: 'bid-ask-spread',
    title: 'The Bid-Ask Spread',
    category: 'Trading Mechanics',
    categoryOrder: 10,
    prerequisites: ['market-vs-limit-orders'],
    estimatedMinutes: 5,
    xpReward: 110,
    summary: 'Understand buyer bids, seller asks, and market liquidity costs.',
    chapters: [
      {
        id: 'ch10-1',
        title: 'Chapter 1: The Two Sides of Order Books',
        content: 'Every stock exchange order book has two competing sides:,\\n\\n1. BID: The highest price buyers are willing to pay right now.\\n2. ASK (OFFER): The lowest price sellers are willing to accept right now.',
        example: 'Buyers stand at BID ₹1,640.00; Sellers stand at ASK ₹1,640.10.',
        keyPoint: 'Buyers bid low; sellers ask high.'
      },
      {
        id: 'ch10-2',
        title: 'Chapter 2: Calculating the Spread Gap',
        content: 'The Bid-Ask Spread is the price difference between Ask and Bid (Spread = Ask - Bid). In highly liquid stocks (like Reliance or HDFC Bank), the spread is tiny (a few paise). In illiquid small-cap stocks, the spread can be wide (several rupees).',
        example: 'Ask ₹1,640.10 - Bid ₹1,640.00 = Spread ₹0.10 (10 paise).',
        keyPoint: 'Tight spreads indicate high liquidity; wide spreads indicate low trading volume.'
      }
    ],
    visualAidType: 'bid-ask-margin',
    keyTakeaways: [
      'BID is buyer max price; ASK is seller min price.',
      'Spread = ASK minus BID.',
      'Tight spreads mean high liquidity and lower trading friction.'
    ],
    quiz: [
      {
        id: 'q10-1',
        question: 'If a stock has a BID of ₹500.00 and an ASK of ₹500.15, what is the Bid-Ask Spread?',
        chapterId: 'ch10-2',
        type: 'multiple-choice',
        options: ['₹0.15', '₹1000.15', '₹500.00', '₹1.50'],
        correctAnswer: 0,
        explanation: 'Spread = Ask (₹500.15) - Bid (₹500.00) = ₹0.15.'
      }
    ]
  },

  // 11. READING CANDLESTICKS
  {
    id: 'reading-candlesticks',
    title: 'Reading Candlestick Charts',
    category: 'Trading Mechanics',
    categoryOrder: 11,
    prerequisites: ['bid-ask-spread'],
    estimatedMinutes: 6,
    xpReward: 150,
    summary: 'Decode OHLC price charts like a professional trader: Open, High, Low, Close candles.',
    chapters: [
      {
        id: 'ch11-1',
        title: 'Chapter 1: Anatomy of OHLC Candles',
        content: 'Candlestick charts display four key price points for any chosen timeframe:,\\n\\n1. Open (O): Price when period started.\\n2. High (H): Maximum price touched.\\n3. Low (L): Minimum price touched.\\n4. Close (C): Final price when period ended.',
        example: 'A 15-minute candle for Nifty 50 shows exact price action between 10:00 AM and 10:15 AM.',
        keyPoint: 'Candles condense 4 data points (OHLC) into a visual shape.'
      },
      {
        id: 'ch11-2',
        title: 'Chapter 2: Bullish (Green) vs Bearish (Red) Bodies',
        content: '1. Bullish Candle (Green): Close price is HIGHER than Open price (Price went UP).\n2. Bearish Candle (Red): Close price is LOWER than Open price (Price went DOWN).',
        example: 'Open ₹1,800, Close ₹1,845 → Green Bullish body.\nOpen ₹1,845, Close ₹1,800 → Red Bearish body.',
        keyPoint: 'Green = Buyers won the timeframe; Red = Sellers pushed prices down.'
      },
      {
        id: 'ch11-3',
        title: 'Chapter 3: Wicks & Price Rejection Shadows',
        content: 'The thin vertical lines above and below the candle body are called wicks or shadows. They show maximum high and low price extremes touched before buyers or sellers pushed back.',
        example: 'A long upper wick indicates buyers tried to push price high, but sellers rejected it and pushed it back down.',
        keyPoint: 'Wicks reveal market price rejection and volatility bounds.'
      }
    ],
    visualAidType: 'candlestick-interactive',
    keyTakeaways: [
      'Green candle = Price closed higher than open (Bullish).',
      'Red candle = Price closed lower than open (Bearish).',
      'Wicks show High and Low price extremes during the period.'
    ],
    quiz: [
      {
        id: 'q11-1',
        question: 'What does a green (bullish) candlestick represent?',
        chapterId: 'ch11-2',
        type: 'multiple-choice',
        options: [
          'The stock closed at a higher price than it opened',
          'The stock closed at a lower price than it opened',
          'Trading was halted by regulators',
          'Zero volume occurred'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 2 explains that a green body signifies Close > Open (buyers pushed price up).'
      }
    ]
  },

  // 12. DOLLAR COST AVERAGING
  {
    id: 'dollar-cost-averaging',
    title: 'Dollar-Cost Averaging (DCA)',
    category: 'Portfolio Strategy',
    categoryOrder: 12,
    prerequisites: ['sips-explained', 'reading-candlesticks'],
    estimatedMinutes: 6,
    xpReward: 130,
    summary: 'Outsmart market volatility by investing consistent sums on a fixed schedule.',
    chapters: [
      {
        id: 'ch12-1',
        title: 'Chapter 1: The Strategy of Fixed Allocation',
        content: 'Dollar-Cost Averaging (DCA) is a disciplined approach where you allocate a fixed cash sum into investments at regular time intervals, regardless of whether news reports market booms or crashes.',
        example: 'Investing ₹5,000 every 1st of the month into an Index ETF.',
        keyPoint: 'DCA removes emotional guesswork from long-term investing.'
      },
      {
        id: 'ch12-2',
        title: 'Chapter 2: Outperforming Lump-Sum Market Timers',
        content: 'Trying to hoard cash and guess the exact bottom of a market crash usually fails. DCA ensures you automatically buy heavily during bear market pullbacks, dramatically lowering your long-term average cost basis.',
        example: 'DCA investors acquired cheap mutual fund units during 2020 market lows, accelerating their recovery wealth.',
        keyPoint: 'Time in the market beats trying to time the market.'
      }
    ],
    visualAidType: 'dca-simulator',
    keyTakeaways: [
      'DCA allocates fixed cash amounts on a regular schedule.',
      'Automatically buys extra shares during market dips.',
      'Proves that time in the market beats market timing.'
    ],
    quiz: [
      {
        id: 'q12-1',
        question: 'Why is DCA effective during market downswings?',
        chapterId: 'ch12-2',
        type: 'multiple-choice',
        options: [
          'Fixed cash contributions automatically buy MORE shares at discount prices',
          'Stock exchange rules freeze prices',
          'Bank interest rates double',
          'No stock can ever fall below ₹0'
        ],
        correctAnswer: 0,
        explanation: 'Chapter 2 shows that fixed dollar contributions acquire larger share quantities when prices fall.'
      }
    ]
  },

  // 13. PORTFOLIO ALLOCATION
  {
    id: 'portfolio-allocation',
    title: 'Portfolio Allocation & Rebalancing',
    category: 'Portfolio Strategy',
    categoryOrder: 13,
    prerequisites: ['dollar-cost-averaging'],
    estimatedMinutes: 6,
    xpReward: 150,
    summary: 'Learn how to structure your growth vs safety mix and rebalance over time.',
    chapters: [
      {
        id: 'ch13-1',
        title: 'Chapter 1: Structuring Asset Mix (Stocks vs Bonds)',
        content: 'Asset allocation determines the proportion of your portfolio split between growth assets (equities) and safety assets (bonds/debt/cash). It accounts for 90%+ of portfolio return variation.',
        example: 'Rule of Thumb (100 - Age): A 22-year-old student allocates 100 - 22 = 78% to Equities for growth, and 22% to Bonds/Debt for stability.',
        keyPoint: 'Younger investors with multi-decade time horizons allocate higher % to growth equities.'
      },
      {
        id: 'ch13-2',
        title: 'Chapter 2: Annual Rebalancing Strategy',
        content: 'As stock prices rally or crash, your asset allocation naturally drifts. Rebalancing means periodically selling overperforming assets or buying underperforming assets once a year to reset target risk proportions.',
        example: 'If equity rallies and turns your 80/20 portfolio into 92/8, selling 12% equity to buy debt resets your risk back to 80/20.',
        keyPoint: 'Rebalancing enforces the ultimate golden rule: selling high and buying low.'
      }
    ],
    visualAidType: 'portfolio-allocation-slider',
    keyTakeaways: [
      'Asset allocation determines overall portfolio risk and return profile.',
      'Use "100 - Age" as a baseline guide for equity vs debt split.',
      'Rebalance annually to reset target risk levels.'
    ],
    quiz: [
      {
        id: 'q13-1',
        question: 'Using the "100 - Age" rule of thumb, how much should a 20-year-old allocate to growth equities?',
        chapterId: 'ch13-1',
        type: 'multiple-choice',
        options: ['80%', '20%', '100%', '50%'],
        correctAnswer: 0,
        explanation: '100 - 20 = 80% target equity allocation for growth.'
      }
    ]
  }
];

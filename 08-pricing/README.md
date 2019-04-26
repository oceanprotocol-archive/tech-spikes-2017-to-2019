﻿[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

# Data pricing and value flows within an efficient data market

```
name: development of a data pricing framework
type: research
status: initial draft
editor: Erwin Kuhn <erwin@oceanprotocol.com>
date: 04/10/2019
```

<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-generate-toc again -->
**Table of Contents**

- [1. Overview](#1-overview)
- [2. Challenges of pricing information goods](#2-challenges-of-pricing-information-goods)
	- [2.1 Basic problem](#21-basic-problem)
	- [2.2 Additional challenges](#22-additional-challenges)
- [3. A valuation framework for data assets](#3-a-valuation-framework-for-data-assets)
- [4. Enabling price discovery within a data market](#4-enabling-price-discovery-within-a-data-market)
	- [4.1 Financial instruments for data assets](#41-financial-instruments-for-data-assets)
	- [4.2 A Bayesian market maker](#42-a-bayesian-market-maker)
	- [4.3 Bonding curves](#43-bonding-curves)
	- [4.4 Other possible market makers](#44-other-possible-market-makers)
- [5. Versioning and flexible pricing](#5-versioning-and-flexible-pricing-wip)
	- [5.1 Query-based data pricing](#51-query-based-data-pricing)
	- [5.2 Quality-based pricing](#52-quality-based-pricing)
- [6. Misc.](#6-misc)
	- [6.1 General considerations](#61-general-considerations)
	- [6.2 Auction models](#62-auction-models)
	- [6.3 Market maker research](#63-market-maker-research)

<!-- markdown-toc end -->


## 1. Overview

![Pricing workflow](./imgs/pricing_workflow.png)

Current data marketplaces suffer from **"seller paralysis"**, where owners of data assets end up disengaging from the platforms, as they are struggling to put a price on their data and to handle negotiations for every transaction. Deriving a fundamental value for such assets is a complex task, and in most cases the market is not mature enough for the needed information to be readily available.

Multiple mechanisms for data pricing have been introduced in the academic literature and existing data marketplaces, but none of them allows for scalable price discovery within a data market. Most papers also assume a current price for a data asset from which flexible pricing options are derived, without tackling the problem of deriving this current price.

Instead, we propose to split the problem in two parts: **establishing an initial valuation** for the data asset or service based on simple heuristics, and then **enabling price discovery** to happen freely on the market through related financial instruments. This construction offers both a more precise price evolution for such assets as well as an easy way to express the pricing of different versions of an asset or service.

To put it simply, there is the **business problem** of getting a rough estimation of what a data asset is worth, and the **technical problem** of allowing an efficient financial market for emerge on top.

The workflow above describes the valuation of a data asset or service along its lifecycle, from the moment it is published by a seller to when it is consumed.

Pricing methods such as query- or quality-based pricing are included here as additional options for a buyer to consume an asset or service.

In addition to priced data, there is a need to determine **clear revenue models for providers of data commons** and how these fit in the broader data market. A few proposals for non-priced and commons data are introduced here. *[to be expanded in future versions of this issue]*

**Preliminary note** 

The "price" of an asset here refers to the **market price** at which one can buy from the owner the right to access it for a given purpose. For example, the price of a license to issue queries or run some algorithm on a dataset for a period T. This notion of value of an asset is different from the ownership value of the asset, which gives one the right to issue licences, determine consumption options and collect cash flows related to the asset. 

In order to simplify the analysis, we will generally **assume the existence of a base price per asset**, from which different consumption options can be priced. For example, the base price could represent the right to download the full dataset and reuse it for commercial purposes, but not republish it. In that scenario, queries issued on the dataset could then be priced according to this base price. It will likely be necessary to define what this base price represents for different types of consumption and service agreements in a future document.


## 2. Challenges of pricing information goods

### 2.1 Basic problem

-   Information goods have different economic properties: they're **non-rival**, and **non-excludable** in the case of data commons
-   **No real existing data market:** it's currently hard to estimate the actual value of most data assets. Frameworks will come over time but the high number of different cases and the non-fungibility of some types of data make it a difficult problem right now.
-   **We can't "let the market take care of it":** the Myerson-Satterthwaite theorem (which basically says "negotiation is hard") implies that the assymetric information bargaining problem cannot be solved efficiently by any mechanism, and will only get worse as the demand for a data asset increases. Simply put, since data is non-rival, you either end up negotiating with every single buyer or sell at often very inefficient prices.
-   Even worse: in the case of data markets, we generally have **experienced buyers** (organizations or individuals w/ data science skills) and **inexperienced sellers** (organizations with data they think is interesting but without any idea about the potential value)
-   **Current solutions in data marketplaces:**
    -   Put up your data asset for a fixed price and adapt according to market feedback. Same thing applies to subscriptions like "get access to datafeed X for T time".
    -   Problem-based pricing: put up a bounty to solve a problem or provide you with the best dataset that fulfills some criteria. This is interesting and we'll come back to it.
-   **In practice:** existing private data marketplaces suffer from **seller paralysis**, where many interested businesses simply don't engage because pricing their data requires too much effort.

### 2.2 Additional challenges

-   **Long-tail markets:** the real strength of data markets will be their long tail of assets. Even if on average very few people use a given data asset, having the possibility to search through all of them and aggregate them is extremely interesting. This also means that there is a need to provide good price discovery and liquidity mechanisms to those long-tail assets.
-   **Incentivizing data commons:** in addition to priced data, there needs to exist other revenue models within the data market, especially for providers of data commons.
-   **Flexible pricing:** imagine you find the gigantic dataset of an air freight company, which details everything that is up travelling in the air at any given moment, its origin and destination. It's very likely that if you're interested in this information, you don't need all of it - only some part of it, like a specific type of good like jewellry. For example, being able to issue queries against this dataset and have them priced dynamically would enable much more flexibility in the market and likely lead to increased liquidity and demand.

## 3. A valuation framework for data assets

Even if we have a good price discovery mechanism, we need to set a reasonable initial price. Markets are not completely efficient, and having a decent idea of what the price might be at the beginning would ensure much faster convergence on the optimal price.

Here are some possible solutions for deriving a reasonable initial price for a given data asset:

**Cost + margin** 

The most simple way is to estimate the cost of the work needed to produce the asset, add a margin on top and set this as the price. This is well-suited to assets that were purposefully produced, and likely harder to apply to assets obtained as a side product of another activity. This approach is both very simple and guarantees profits for the owner, which makes it an attractive first estimation. A more precise valuation can then be achieved through price discovery on the market.

The price can be expressed as `production_cost * 1/k * m` with `k` the expected number of sales and `m > 1` the margin ratio. `k` can be initially underestimated to ensure a profit on the first few sales, letting the market bring down the price if needed.

**Endpoint pricing** 

It's much easier to determine how much a solution to a problem is worth to a buyer than to price raw data that will go through multiples transformations down the road. A solution as mentioned here could both be a curated dataset formed from aggregating and cleaning multiple others, or a service such as querying a trained ML model.

The price estimated for these solutions could then directly help inform lower levels of the stack about the price of their assets and services.

This type of pricing can take the form of a direct evaluation [**customer-based**], bounties *reach a certain threshold to get X* or competition prizes *(best solution gets X)* [**problem-based**]

**Existing assets or valuation frameworks** 

For types of data where similar assets or solutions already exist on the market, pricing at a similar value provides a good first estimation. Examples could include pricing financial data relative to existing Bloomberg offers, or, to follow up on a previous example, pricing boat cargo data similarly to the data of an air freight company.

Overtime, we expect more advanced valuation frameworks to emerge, as the market matures both in terms of assets available and actors involved.

**Marketplace tools**

In order to help sellers value their data assets, it is likely that marketplaces include most of the heuristics described above and future valuation frameworks directly in their interface. Assisting owners in bringing their assets to market would be a very valuable service, especially given the current state of data marketplaces, and thus an interesting business model for future marketplaces.

Here are some ideas of what this integration of data pricing within a marketplace interface could look like:

- **Simple visualizations for heuristics** such as the ones described above. For example, in the very simple "cost + margin" model, the marketplace could provide the seller with an estimation of the number of sales of their asset at a given price. Given a value for the margin ratio `m`, this visualization would make it easy to set `k` the expected number of sales to reach an initial profit target.
- **Dynamic pricing tools:** Airbnb has become famous for providing one of the most advanced dynamic pricing tools to its hosts, in order to estimate the value of their listing. While the real estate and hotel markets are well-established ones and could in this case provide some prior information about the fundamental value of houses in a certain area, the number of different factors taken into account for each listing is impressive. It proves such complex pricing tools can be developed, provided one has enough information and technical knowledge available. Similar tools could be developed directly within data marketplaces to incorporate different valuation frameworks with market information in order to help sellers price their datasets.
- **Continuous feedback:** for a given asset, once an initial price has been set, the market will take over and drive continuous price evolution. However, in order to help sellers better understand the dynamics behind consumer behavior, data marketplaces could provide them with feedback regarding their already listed assets. Potential feedback includes consumer interest within the marketplce itself, price evolution, the number and type of queries each asset receives and derive recommandations from this information. For example, a dataset receiving lots of small queries from different buyers without any follow-up with larger requests is likely one that attracts initial attention, but is considered unsatisfactory by the potential buyers who probe it with smaller queries first.

All these services are likely to improve overtime as more data becomes available for analysis by marketplaces.

**Resources concerning Airbnb's dynamic pricing model:**
- [Customized regression model for Airbnb dynamic pricing](https://blog.acolyer.org/2018/10/03/customized-regression-model-for-airbnb-dynamic-pricing/) - paper by Ye et al., 2018 + blog post
- [Learning Market Dynamics for Optimal Pricing](https://medium.com/airbnb-engineering/learning-market-dynamics-for-optimal-pricing-97cffbcc53e3) - Medium post by Airbnb's Data Science team
- [Airbnb Dynamic Pricing Optimization](https://github.com/tule2236/Airbnb-Dynamic-Pricing-Optimization) - A project to optimize yearly revenue of an Airbnb listing

## 4. Enabling price discovery within a data market

### 4.1 Financial instruments for data assets

Data by itself is hard to trade. Without introducing artificial scarcity, the supply of a given asset is expandable at will, only constrained by the network, storage and computation resources of the provider. In addition to that, we expect most assets to not be tradeable altogether, because the data or algorithm will not leave the premise. The assets themselves are non-rivalrous, which means typical bid / ask markets cannot emerge for them. 

In order to enable the emergence of financial markets around data assets, which will ensure an efficient price discovery process, we introduce for each asset an **associated financial instrument** which aims to track the price for the underlying asset. These take the form of **"option tokens"** which can be redeemed at any time for the different services offered for that asset. Because each option token is a private good, that is to say a rivalrous, exclusive good, they can be easily traded on an open market. And as each token directly gives access to the underlying asset, **market forces can effectively drive price discovery.**

Additionally, these option tokens enable a simple way of **expressing the price of [different versions](#5-versioning-and-flexible-pricing-wip) of the asset**: they can be priced directly in the associated token, relatively to one another. As an example, assuming the price of 1 option token is `market_price`, the price of a query that very simply returns the first quarter of the dataset would be 0.25 option tokens, or `0.25*market_price`.

These option tokens could also be sold to other parties, and rebundled together by curators to offer an interesting package of assets and services to an interested buyer.

Two mechanisms are needed for these financial instruments: an **issuance mechanism** and a **market maker**, to provide liquidity, especially in the case of long-tail assets.

In most cases, a central automated market maker also takes care of the issuance: buying from and selling to it corresponds to the issuance and burn of those tokens. We introduce two such mechanisms.

### 4.2 A Bayesian market maker

The currently most promising area of research for such a mechanism seems to be that of Bayesian market makers. The design is inspired by prediction market makers, which exhibit interesting properties since they financially incentivize all participants to reveal their true beliefs and aggregate them in the price. They also allow short-selling as well as longs, since the two are symmetric in terms of outcomes. However, even scaled market maker which can provide information for a value on a continuous range (and not just Yes / No predictions) are limited to a predefined interval `[min, max]` and have to resolve at some point in order to distribute rewards.

Bayesian market makers solve these problems: they can **aggregate information about a continuous variable** in the form of a price, **constantly offer bid and ask prices** and operate on an **indefinite timescale**.

They operate as follows: the market maker (MM) maintains an internal state which represents **an estimation of the current value** of an asset, in the form of a probability distribution around a mean, and **updates its estimation based on the order it receives.**. At all times, the market maker offers a bid price <img src="https://tex.s2cms.ru/svg/%5Cinline%20b_t" alt="\inline b_t" /> (at which traders can sell to the MM) and an ask price <img src="https://tex.s2cms.ru/svg/%5Cinline%20a_t" alt="\inline a_t" /> (at which traders can buy from the MM). Assuming that if a trader sells to the MM, the real value is below the current estimation, and inversely if a trader buys, the MM updates its probability estimations according to the Bayes formula, based on the order it just received.

The instantaneous bid and ask prices are defined as what the MM would estimate the real value to be if a trader was willing to sell or buy from it.

<img src="https://tex.s2cms.ru/svg/%20a_t%20%3D%20E(V%20%7C%20%5Cmathrm%7Bbuy%7D)%20%5C%5C%20b_t%20%3D%20E(V%20%7C%20%5Cmathrm%7Bsell%7D)%20" alt=" a_t = E(V | \mathrm{buy}) \\ b_t = E(V | \mathrm{sell}) " />

The internal state update is then derived as follows. Let <img src="https://tex.s2cms.ru/svg/%5Cinline%20p_t(v)" alt="\inline p_t(v)" /> represent the internal probability distribution of the MM and <img src="https://tex.s2cms.ru/svg/%5Cinline%20q_o%20(v%2C%20a_t%2C%20b_t)" alt="\inline q_o (v, a_t, b_t)" /> the estimated probability of receiving an order <img src="https://tex.s2cms.ru/svg/%5Cinline%20o" alt="\inline o" /> given the current estimated value <img src="https://tex.s2cms.ru/svg/%5Cinline%20V" alt="\inline V" />, and the bid and ask prices <img src="https://tex.s2cms.ru/svg/%5Cinline%20a_t%2C%20b_t" alt="\inline a_t, b_t" />. <img src="https://tex.s2cms.ru/svg/%5Cinline%20%5Cmathcal%7BA%7D_t" alt="\inline \mathcal{A}_t" /> is a normalization constant.

<img src="https://tex.s2cms.ru/svg/p_%7Bt%2B1%7D(v)%20%3D%20p_t(v)%20%5Cfrac%20%7Bq_o(v%2C%20a_t%2C%20b_t)%7D%20%7B%5Cmathcal%7BA%7D_t%7D%20" alt="p_{t+1}(v) = p_t(v) \frac {q_o(v, a_t, b_t)} {\mathcal{A}_t} " />

Generally, the internal probability distribution is a Gaussian as it can be represented with two variables (the mean and the variance) and provides good results in practice.

Parameters can be tuned to **adjust the strategy of the market maker**: it can either aim for zero profits, immediate profits or long-term profits. Note that monopolistic profit-optimizing market makers can actually provide more liquidity than zero-profit ones in some scenarios: in case of a sudden change in the perceived underlying value, a strategic market maker can aim to take an immediate loss in order to converge more rapidly on the new equilibrium price.

**Open problems:**
- The design is experimental, despite convincing results in previous simulations. A concrete implementation is needed to try it out.
- Despite being **profitable on average**, even when aiming for zero-profits, **the worst-case loss of this market maker is unbounded**. This can be countered by preventing selling to the market maker once its cash reserves are depleted, letting the MM aim for profits in order to cover instable periods or having a liquidity provider ready to take the loss in exchange for future profits.
- Fixed minimum size orders
- Computational efficiency?
- Can it allow for uncovered selling (~ short-selling)? How much, based on reserves?

**References:**
- [A Bayesian Market Maker](papers/marketmakers/Das2012_BayesianMM.pdf) - Das et al., 2012
- [Adapting to a Market Shock: Optimal Sequential Market-Making](papers/marketmakers/Das2008_OptimalSequentialMM.pdf) - Das et al., 2008
- [A Learning Market-Maker in the Glosten-Milgrom Model](papers/marketmakers/Das2005_LearningMM.pdf) - Das, 2005

### 4.3 Bonding curves

Another possibility for the automated market maker of each option token consists of implementing a bonding curve. This mechanism has interesting properties of preserving a positive reserve at all times, eventually making a profit based on the design choices. However, the main problem remains that a bonding curve set with an initial price of X can't allow the price of its token to go below X. We expect that most data assets will end up depreciating in price over a certain period of time, so this point is especially problematic.

**Open design choices**

-   **Choice of the bonding curve:** this is equivalent to determining what invariant is wanted. It should be based on some desired property of the mathematical function. Existing designs include a constant reserve ratio (Bancor model), sigmoid functions, rule-based functions (X% increase in price for an Y% increased in the outstanding supply), etc
-   **Incentives for price discovery:** in the simplest design, the only incentive for traders to buy or sell some license token AD and participate in price discovery is a purely **speculative incentive**, hoping to sell at a higher price than one bought. Adding fees to transactions / the consumption of a service or a bid/ask spread into the bonding curve could serve to additionally **subsidize price discovery** by redistributing this value to the current holders of the license token, including the speculators.
-   **Consumption:** what does it mean to consume a license token to receive a service? The simplest version would be a transfer of a certain amount X of license tokens to the owner and let her sell those into the bonding curve to collect profits. Additional mechanisms could include: burning part of the X tokens, which would provide a floor to the bonding curve higher than the initial price and effectively redistributing value; the mechanisms mentioned above to subsidize price discovery.

**Open problems**

- Impossibility of **going below initial price**
- **Short-selling** on bonding curves (see issue #47)

**References for the choice of a bonding curve function:** 

-   [On Single Bonding Curves for Token Models](https://medium.com/thoughtchains/on-single-bonding-curves-for-continuous-token-models-a167f5ffef89) - Wilson Lau
-   [Bonding Curves In Depth: Intuition & Parametrization](https://blog.relevant.community/bonding-curves-in-depth-intuition-parametrization-d3905a681e0a) - Slava Balasanov
-   [How to Make Bonding Curves for Continuous Token Models](https://blog.relevant.community/how-to-make-bonding-curves-for-continuous-token-models-3784653f8b17) - Slava Balasonov [includes an example of a dynamic bonding curve based on inflation]


### 4.4 Other possible market makers
- [LSMR](#63-market-maker-research) or [LS-LSMR](#63-market-maker-research) (liquidity-sensitive logarithmic market scoring rule) for a scaled prediction market on a `[min, max]` interval.
- [Equilibrium bonding market](https://blog.oceanprotocol.com/introducing-the-equilibrium-bonding-market-e7db528e0eff): doesn't include an issuance mechanism + cognitive load of maintaining a sell price at all times for traders.

## 5. Versioning and flexible pricing [WIP]

Since data assets and services can be duplicated at nearly zero cost or offered to multiple buyers at the same time, it makes sense to price them based on the value the end-customer derives from them. An efficient way of doing so, while maintaining a coherence between different offers, is **versioning**: offering different versions of the same asset to buyers based on their needs. 

The two main mechanisms introduced here to do so are: **query-based pricing** and **quality adjustments**. 

### 5.1 Query-based data pricing

**Desired properties**

- **Arbitrage-free:** it should not possible to deduce the result of a query from a cheaper set of small queries.
- **Regret-free:** a buyer issuing multiple queries should not pay twice for the same information. For example, if someone issues a small query against a dataset to inspect it for $20, and then decides to buy the whole dataset for $200, the buyer should pay $200 in total, and not $220.
- **Non-informative:** it should not possible to recover information about the dataset just by asking for prices of specific queries

**Current direction of research:** The framework introduced in [[Kifer, Lin, 2014]](papers/querypricing/GeneralDataQueriesPricing_Kifer2014.pdf) is promising, offering pricing schemes for general queries in both instance-independent and instance-dependent scenarios. One especially interesting suggestion is pricing based on mutual information (in the information-theoretic sense) between the query and the relational schema. However, the paper relies heavily on the formal model of relational databases, while Ocean currently operates with MongoDB and ElasticSearch, in a NoSQL paradigm. Formal models of NoSQL databases exist, but are pretty recent in academic research.

It remains to be seen whether an efficient algorithm for pricing general queries can be deduced and translated from relational algebra to a formal model of NoSQL databases.

**Existing designs (technical notes, the reader is allowed to skip this section)**

The canonical design introduced by Koutris basically relies on providing a **base set of views** with prices `(Vi,pi)` for the database and deriving the price of any query (that fits some complexity constraints) from there. The price calculation is done by finding the minimal support needed for the query, i.e. the cheapest subset of the initial views that determines the query in the current database instance. This pricing method can be applied if and only if the base set of priced views is consistent, i.e. is both arbitrage-free and discount-free.

The class of queries priced by this method is the UCQ (Unions of Conjunctive Queries) class, with support for user-defined functions in the query. The problem is generally NP-hard but solved by application of an ILP (Integer Linear Programming) solver.

Note that the design is different from a pay-per-tuple or volume-based pricing since the predefined views are arbitrary and can for example also be much coarser. 

The paper by Li and Miklau introduces pricing schemes for linear aggregate queries, basically corresponding to `SUM`, `AVG` and `COUNT` queries. The database is classified in categories (for example a population database could be split up according to gender and age ranges of 10 years) and expressed as vector `x`. A query is expressed as a matrix `q` of weights and the result is computed as `x . q`. Results from linear algebra enable efficient arbitrage-free pricing, as well as the pricing of queries based on the information already retrieved with previous queries.

The conditions on the pricing function are different: the pricing is instance-independent, can be obtained before buying the query and reveals no information about the underlying dataset. However, as soon as the discount-free property is also taken into account, a peculiar result emerges: there are only two possible prices for an aggregate query. Either that query belongs to the predefined views and its price is `p_low` or it doesn't and its price is `p_high`. This is problematic and likely calls for a relaxation of the discount-free property in order to have a sensible pricing function.

**Problem:** the design is straightforward but also somewhat circular with regards to the initial set of priced views. These still need to be priced, and both determining which views are relevant (for example the translation of a given word in a dictionary database) and pricing those base views may not be a simple problem at all.

One elegant attack on the Li and Miklau scheme appears as soon as we move out of the context of linear algebra and the buyer can start using nonlinear processing. Let's examine a case where `x` is a binary vector, i.e. each category corresponds to a yes/no answer. A query `q = [1, 2, 4, 8, 16...]` returns a result `q . x` whose binary representation is exactly `x`.

The other important aspect to note is that the original definitions from the two approaches are **incompatible with one another: one is instance-dependent, the other is not**. In order to express the arbitrage-free property, a notion of determinacy has to be introduced (i.e. what is the smallest subset of views `(Q1, ..., Qn)` that determines the result of the query `Q`). Determinacy can be expressed in a contextual manner in order to take into account edge cases based on the actual database instance or in an information-theoretic perspective and be independent of the database instance

**References:**

- [Query-Based Data Pricing](papers/querypricing/QueryPricing_Koutris15.pdf) - Koutris et al., 2015
- [Toward Practical Query Pricing with QueryMarket](papers/querypricing/QueryMarket_Koutris2013.pdf) - Koutris et al., 2013 [ILP optimization on NP-hard pricing problem]
- [Pricing Aggregate Queries in a Data Marketplace](papers/querypricing/PricingAggregateQueries_LiMiklau2012.pdf) - Li, Miklau, 2012
- [On Arbitrage-free Pricing for General Data Queries](papers/querypricing/GeneralDataQueriesPricing_Kifer2014.pdf) - Kifer, Lin, 2014

### 5.2 Quality-based pricing

Not all buyers have the same needs, and this is true both in terms of the content of the data / service they need, as well as its accuracy. One way of flexibly pricing data is to allow anyone to specify a maximum price they are willing to pay, and provide them with **a version of the asset adapted to their announced price**. If the announced price is below the price for the complete asset, some noise is injected in the dataset or ML model and the resulting asset or service can be sold or cheaper.

This approach is taken by [[Stahl et al., 2016]](papers/qualitybased/KnapsackPricingData_Stahl2016.pdf) for datasets and [[Koutris et al., 2018]](papers/qualitybased/MLpricing_Koutris2018.pdf) for ML models.

Another approach is providing a **random sample of the data**, in case it is fungible. This is introduced for XML data by [[Tang et al., 2016]](papers/qualitybased/XMLDataPricing_Tang2016.pdf) and should be easily adaptable to any type of hierarchically structured data.

[[Li, Miklau et al., 2012]](papers/qualitybased/PricingPrivateData_LiMiklau2012.pdf) introduced a similar scheme for selling private data (where buyers can directly access or download it), compensating individuals based on their loss privacy. The mechanism relies on techniques of differential privacy and is adaptable to quality-based pricing.

**References**

- [Fair Knapsack Pricing for Data Marketplaces](papers/qualitybased/KnapsackPricingData_Stahl2016.pdf) - Stahl et al., 2016
- [A Framework for Sampling-Based XML Data Pricing](papers/qualitybased/XMLDataPricing_Tang2016.pdf) - Tang et al., 2016 (random sample from tree-structured data)
- [A Theory of Pricing Private Data](papers/qualitybased/PricingPrivateData_LiMiklau2012.pdf) - Li, Miklau et al., 2012 (compensating for privacy loss based on differential privacy)
- [How to Balance Privacy and Money through Pricing Mechanism in Personal Data Market](papers/qualitybased/PersonalDataPricing_NgetCao2018.pdf) - Nget, Cao et al., 2018  

**ML models:**
- [Model-based Pricing for Machine Learning in a Data Marketplace](papers/qualitybased/MLpricing_Koutris2018.pdf) - Koutris et al., 2018 (price ~ accuracy)

## 6. Misc.

### 6.1 General considerations

**Surveys:**
- [Pricing Approaches for Data Markets](papers/general/Muschalle13_PricingApproachesDataMarkets.pdf) - Muschalle et al., 2013
- [Pricing of data products in data marketplaces](papers/general/Fricker2017_PricingDataMarketplaces.pdf) - Fricker et al., 2017

**Technical references:**
- [Market Model and Optimal Pricing Scheme of Big Data and Internet of Things (IoT)](papers/general/UtilityOptimalDataPricing_Niyato2016.pdf) - Niyato et al., 2016
- [Pricing for Data Markets](papers/general/PricingDataMarkets_Kushal2012.pdf) - Kushal et al., 2012

### 6.2 Auction models

[WIP] 

### 6.3 Market maker research
Further references on LMSR and other types of market makers.

**References:**
- [Logarithmic Market Scoring Rules for Modular Combinatorial Information Aggregation](papers/marketmakers/LMSR_Hanson2002.pdf) - Hanson, 2002
- [A Practical Liquidity-Sensitive Automated Market Maker](papers/marketmakers/LiquidityMarketMaker_Pennock2013.pdf) - Pennock et al. 2013
- [A Utility Framework for Bounded-Loss Market Makers](papers/marketmakers/UtilityMarkerMakerPennockChen2007.pdf) - Chen, Pennock, 2007
- [A New Understanding of Prediction Markets Via No-Regret Learning](papers/marketmakers/NoRegretPredictionMarkets_VaughanChen2010.pdf) - Chen, Vaughan, 2010
- Paul Sztorc's [archive on prediction markets](http://bitcoinhivemind.com/papers/), especially his Excel file detailing a lot of market types

**Bayesian / rational market makers:**
- [Rational Market Making with Probabilistic Knowledge](papers/marketmakers/OthmanSandholm12_RationalMM.pdf) - Othman, Sandholm, 2012

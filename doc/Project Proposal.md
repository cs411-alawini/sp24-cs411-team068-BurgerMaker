# Burger Crypto: Project Proposal

1. **Project Title**

   Burger Crypto (A Online virtual crypto investment system)

2. **Project Summary**
   The Virtual Crypto Investment System is a web-based application designed to simulate cryptocurrency investments without financial risk. This project aims to provide users with a platform to practice and understand crypto trading dynamics, market analysis, and portfolio management in a controlled, virtual environment. By utilizing real-time and historical cryptocurrency data, users can experiment with investment strategies, track their virtual portfolio's performance, and gain insights into market trends. This project will challenge our DBMS skills through the efficient handling of large datasets, real-time data processing, and complex query execution to provide a responsive and insightful user experience.

3. **Description of the Application**
   - **Problem Statement**: Despite the growing interest in cryptocurrency investments, many potential investors lack the knowledge or experience to navigate the volatile crypto market confidently. 
   - **Objective**: To create a risk-free, educational platform that leverages real-world data to simulate cryptocurrency investment scenarios, helping users to learn trading strategies, understand market trends, and manage virtual portfolios effectively.

4. **Creative Component**

   - The system will feature an AI-driven investment advisor that analyzes users' trading behaviors, market trends, and historical data to suggest personalized investment strategies. 
   - This system will also involve complex data algorithms and real-time data analytics, showcasing our ability to handle and process large datasets dynamically and provide actionable insights to users.
   - TODO: make charts in UI clear

5. **Usefulness**
   
   TODO: improve usefulness for clarity

   This application serves as an educational tool for aspiring crypto investors, offering features like real-time trading simulation, portfolio management and strategy recommendations. Unlike existing platforms like [Robinhood](https://robinhood.com/), [CryptoParrot](https://cryptoparrot.com/), our system focuses on education and practice, equipped with a recommendation engine for personalized learning experiences. This uniqueness lies in its educational value, real-time data integration, and personalized user engagement.

6. **Realness and Data Sources**
   We will use real-time and historical cryptocurrency data from APIs such as [CoinGecko](https://www.coingecko.com/en/api), [CoinCap](https://docs.coincap.io/#intro) and [CryptoCompare](https://min-api.cryptocompare.com/). These sources offer JSON data formats, including price, volume, market cap, and historical trade data. By integrating multiple datasets, we ensure the application reflects current market conditions and provides a realistic trading simulation.

7. **Functionality Description**
   Users can create, manage, and track virtual portfolios, simulate trades, view real-time market data, and receive personalized strategy recommendations. The application will support user authentication, portfolio creation/updation/deletion, and complex queries for data analytics, such as calculating the portfolio's performance over time.

   TODO: detail, usecase for every CRUD

   - **Low-Fidelity UI Mockup**
     A sketch will depict the dashboard with real-time cryptocurrency data, a portfolio management section, trading simulation interface, and personalized recommendation alerts. The UI will be designed for ease of navigation and user engagement.

     ![](asset/demo01.jpg)

     ![](asset/demo02.jpg)

   - **Project Work Distribution**
     The project will be divided into tasks such as frontend development, backend/database management, data integration (APIs), AI recommendation engine development, and testing.
     The backend and database management tasks will involve:

     - integrating external data sources (@yh63, @bohanw5)

     - designing the database schema (@yuanzez2, @ziyang8)

     - implementing data storage and retrieval mechanisms 
       - User module (@bohanw5, @yh63)
       - Trade module (@yuanzez2, @ziyang8)

     - ensuring data consistency and security (@bohanw5, @yh63, @yuanzez2, @ziyang8)

   
TODO: Add a para to indicate changes of proposal.
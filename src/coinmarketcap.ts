import axios, { AxiosResponse } from "axios";

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

const COINMARKETCAP_API_ENDPOINT = COINMARKETCAP_API_KEY
  ? "https://pro-api.coinmarketcap.com"
  : "https://sandbox-api.coinmarketcap.com";

export const getTokenPrice = (tokenSymbol: string, fiatSymbol: string) => {
  return new Promise((resolve, reject) => {
    if (!tokenSymbol) {
      reject({ message: "Token symbol is required" });
    }
    if (!fiatSymbol) {
      reject({ message: "Fiat symbol is required" });
    }

    axios
      .get(
        `${COINMARKETCAP_API_ENDPOINT}/v2/cryptocurrency/quotes/latest?symbol=${tokenSymbol}&convert=${fiatSymbol}`,
        {
          headers: {
            "X-CMC_PRO_API_KEY":
              COINMARKETCAP_API_KEY || "b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c",
          },
        }
      )
      .then((response) => {
        if (response) {
          // success
          const json = response.data;
          if (json.data && json.data[tokenSymbol]) {
            resolve(json.data[tokenSymbol]);
          } else {
            reject({ message: "Token not found" });
          }
        }
      })
      .catch((ex) => {
        reject(ex);
      });
  });
};

export const extractQuoteProperty = (
  cryptocurrencyObjectsArray: any,
  quoteId: string,
  propertyName: string
) => {
  return (
    (cryptocurrencyObjectsArray &&
      cryptocurrencyObjectsArray[0] &&
      cryptocurrencyObjectsArray[0].quote &&
      cryptocurrencyObjectsArray[0].quote[quoteId] &&
      cryptocurrencyObjectsArray[0].quote[quoteId][propertyName]) ||
    null
  );
};
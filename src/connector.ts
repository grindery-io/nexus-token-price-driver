import {
  ConnectorInput,
  ConnectorDefinition,
  ActionOutput,
} from "grindery-nexus-common-utils";
import {
  extractQuoteProperty,
  getTokenPrice,
  getTokenSymbolByAddress,
} from "./coinmarketcap";

let debugOutput = "Hello World!";

function addDebugOutput(output: string) {
  if (debugOutput.length > 10000) {
    debugOutput = "(truncated)";
  }
  debugOutput += `\n[${new Date().toISOString()}] ${output}`;
}

async function getTokenPriceBySymbol(
  params: ConnectorInput<unknown>
): Promise<ActionOutput> {
  const fields = params.fields as {
    tokenSymbol: string;
    fiatSymbol: string;
  };

  let res: any;
  try {
    res = await getTokenPrice(fields.tokenSymbol, fields.fiatSymbol);
  } catch (err) {
    console.log("res error", err.message);
  }

  if (res) {
    const price = extractQuoteProperty(res, fields.fiatSymbol, "price");
    const lastUpdated = extractQuoteProperty(
      res,
      fields.fiatSymbol,
      "last_updated"
    );
    if (price) {
      addDebugOutput(`[${params.sessionId}] Price: ${price}`);
      return {
        payload: {
          tokenSymbol: fields.tokenSymbol,
          fiatSymbol: fields.fiatSymbol,
          price,
          lastUpdated,
        },
      };
    }
  }

  return {
    payload: {
      tokenSymbol: fields.tokenSymbol,
      fiatSybmol: fields.fiatSymbol,
      price: "",
      lastUpdated: "",
    },
  };
}

async function getTokenPriceByAddress(
  params: ConnectorInput<unknown>
): Promise<ActionOutput> {
  const fields = params.fields as {
    tokenAddress: string;
    fiatSymbol: string;
  };

  let tokenSymbol;
  try {
    tokenSymbol = await getTokenSymbolByAddress(fields.tokenAddress);
  } catch (err) {
    console.log("res error", err.message);
  }

  if (tokenSymbol) {
    let res: any;
    try {
      res = await getTokenPrice(tokenSymbol, fields.fiatSymbol);
    } catch (err) {
      console.log("res error", err.message);
    }

    if (res) {
      const price = extractQuoteProperty(res, fields.fiatSymbol, "price");
      const lastUpdated = extractQuoteProperty(
        res,
        fields.fiatSymbol,
        "last_updated"
      );
      if (price) {
        addDebugOutput(`[${params.sessionId}] Price: ${price}`);
        return {
          payload: {
            tokenAddress: fields.tokenAddress,
            tokenSymbol,
            fiatSymbol: fields.fiatSymbol,
            price,
            lastUpdated,
          },
        };
      }
    }
  }

  return {
    payload: {
      tokenAddress: fields.tokenAddress,
      tokenSymbol: "",
      fiatSybmol: fields.fiatSymbol,
      price: "",
      lastUpdated: "",
    },
  };
}

export const CONNECTOR_DEFINITION: ConnectorDefinition = {
  actions: { getTokenPriceBySymbol, getTokenPriceByAddress },
  triggers: {},
  webhooks: {},
  options: {
    mutateRoutes: (app) => {
      app.get("/debug", (req, res) => res.type("text").send(debugOutput).end());
    },
  },
};

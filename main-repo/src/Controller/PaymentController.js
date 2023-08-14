import Stripe from "stripe";
import stripeConfig from "../Config/stripeConfig.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import oauth2 from "client-oauth2";
import PaymentInfoModel from "../DB/Model/paymentModel.js";
import axios from "axios";
const stripe = new Stripe(stripeConfig.SECRET_KEY);
export const CreateCustomer = async (req, res, next) => {
  try {
    const { email, cardHolder, accountId, number, exp_month, exp_year, cvc } =
      req.body;

    const findCustomer = await PaymentInfoModel.find({email: email});
    


    const account = await stripe.accounts.create({
      type: "custom",
      country: "US",
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    const createCustomer = await stripe.customers.create({
      email: email,
      name: cardHolder,
      metadata: {
        connected_account_id: account.id,
      },
    });

    if (createCustomer) {
      const saveInfo = await PaymentInfoModel.create({
        email: email,
        accountId: account.id,

      })
      return next(
        CustomSuccess.createSuccess(
          { customer: createCustomer, account: account },
          "Card Added Successfully",
          200
        )
      );
      // }
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 400));
  }
};

export const AddCard = async (req, res, next) => {
  try {
    // const cardToken = await stripe.tokens.create({
    //   card: {
    //     name: "Khizer Riaz",
    //     number: "4242424242424242",
    //     exp_month: "4",
    //     exp_year: "2024",
    //     cvc: "123",
    //   },
    // });
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: "pm_card_visa",
    });
    // console.log("CARD TOKEN ", cardToken);
    // const addCard = await stripe.customers.createSource("cus_OIX3lJQrMdBUau", {
    //   source: `${cardToken.id}`,
    // });
    // if (addCard) {
    //   return next(
    //     CustomSuccess.createSuccess(addCard, "Card Added Successfully", 200)
    //   );
    // }
  } catch (error) {
    return next(CustomError.createError(error.message, 400));
  }
};

export const MakePayment = async (req, res, next) => {
  try {
    // const payment = await stripe.charges.create({
    //   receipt_email: "khizer.riaz@jumppace.com",
    //   amount: 500 * 100,
    //   description: "sessionId",
    //   currency: "USD",
    //   card: "card_1NVwq2AqcVjRxFkjVcjY9lFs",
    //   customer: "cus_OIX3lJQrMdBUau",
    // });
    const authorizeUrl = stripe.oauth.authorizeUrl({
      client_id: "ca_OFdX4x2657VhqYyjoZzm4dKuWWq5FYdc",
      redirect_uri: "http://localhost:7002/api/v1/diyer/payment/test",
      state: "test-statuss",
      scope: "read_write",
    });

    return next(
      CustomSuccess.createSuccess(
        { payment: authorizeUrl },
        "Payment Added To Escrow",
        200
      )
    );
    // }
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 400));
  }
};
export const testing = async (req, res) => {
  try {
    const authorizationCode = req.query.code;
    const tokenResponse = await stripe.oauth.token({
      grant_type: "authorization_code",
      code: authorizationCode,
    });
    const transfer = await stripe.transfers.create({
      amount: amount,
      currency: "usd",
      destination: tokenResponse.stripe_user_id,
    });

    console.log("transfer => ", transfer);

    res.json("ok");
  } catch (err) {
    console.log(err.message);
  }
};

// Replace these values with your Stripe Connect application details

// Function to get the access token using the "Client Credentials" grant type
async function getAccessToken() {
  try {
    const CLIENT_ID = "ca_OFdX4x2657VhqYyjoZzm4dKuWWq5FYdc";
    const CLIENT_SECRET =
      "sk_test_51NSlpBAqcVjRxFkjnOxxCBubaR6z5qAj49JLX1vVpbIufTIkqFUonlwNsuEg2uFe8ORmhDTwTgbMMTzDMh7KFkex009u5nUPWi";

    // Initialize the OAuth2 client
    const client = new oauth2({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      // accessTokenUri: "https://connect.stripe.com/oauth/token",
      authorizationUri: "https://connect.stripe.com/oauth/authorize",
    });
    // Request the access token using the "client_credentials" grant type
    const result = client.code.getUri();

    // Extract the access token from the response
    const accessToken = result;

    // You now have the access token for the connected account
    console.log("Access Token:", accessToken);

    // You can use the access token to perform actions on behalf of the connected account, such as scheduling payouts.

    // return accessToken;
  } catch (error) {
    console.error("Error getting access token:", error.message);
    throw new Error("Error obtaining access token.");
  }
}

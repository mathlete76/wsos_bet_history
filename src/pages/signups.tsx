import type { NextPage } from "next";
import Head from "next/head";
import { SignUpsView } from "views/signups";

const Signups: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Bet Records</title>
        <meta
          name="description"
          content="Sign Up Page"
        />
      </Head>
      <SignUpsView />
    </div>
  );
};

export default Signups;

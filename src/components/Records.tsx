// TODO: SignMessage
import { verify } from '@noble/ed25519';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useCallback, useEffect, useState } from 'react';
import { notify } from "../utils/notifications";
import { Program, AnchorProvider, web3, utils, BN } from "@project-serum/anchor";
import idl from "./bet_history.json";
import { PublicKey, Keypair } from '@solana/web3.js';

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);

const programID = new PublicKey(idl.metadata.address);

export const Records: FC = () => {
    const ourWallet = useWallet();
    const { connection } = useConnection();

    console.log("Wallet: ", ourWallet);

    const [recordAccounts, setRecordAccounts] = useState([]);

    const [username, setUsername] = useState('');


    const getProvider = () => {
        const provider = new AnchorProvider(connection, ourWallet, AnchorProvider.defaultOptions());
        return provider;
    }

    const initRecords = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program(idl_object, programID, anchProvider);
            const [recordsAccount] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode("recorda"),
                anchProvider.wallet.publicKey.toBuffer(),
            ], program.programId);

            const [genesisBetAccount] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode("firstbeta"),
                recordsAccount.toBuffer(),
            ], program.programId);
            
            return program.rpc.initRecords("Davie's Bet Records", {
                accounts: {
                    recordsAccount,
                    genesisBetAccount,
                    authority: anchProvider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                },
            });

            console.log("Records account created: ", recordsAccount.toBase58());
            console.log("Genesis bet account created: ", genesisBetAccount.toBase58());
        }
        catch (err) {
            console.log("Error while initialising bet records: ", err);
        }
    };

    const signupUser = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program(idl_object, programID, anchProvider);
            const newuser = username;
            const [useraccount] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode(newuser),
                anchProvider.wallet.publicKey.toBuffer(),
            ], program.programId);

            console.log("User account: ", useraccount.toBase58());

            await program.rpc.signupUser(newuser, {
                accounts: {
                    userAccount: useraccount,
                    authority: anchProvider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                },
            })

            console.log("User signed up: ", newuser);
            setUsername('');
        }
        catch (err) {
            console.log("Error while signing up user: ", err);
        }
    };

    const getRecordAccounts = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program(idl_object, programID, anchProvider);

            const [recordsAccount] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode("recorda"),
                anchProvider.wallet.publicKey.toBuffer(),
            ], program.programId);

            const recordsAccountInfo = await connection.getAccountInfo(recordsAccount);
            if (recordsAccountInfo === null) {
                console.log("Records account not found");
                return;
            }

            console.log("Records account found: ", recordsAccount.toBase58());

            setRecordAccounts([recordsAccount.toBase58()]);
        }
        catch (err) {
            console.log("Error while getting bet records accounts: ", err);
        }
    };


    const [accountExists, setAccountExists] = useState(false);
    const [pdaPublicKey, setPdaPublicKey] = useState(null);

    const checkAccountExists = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program(idl_object, programID, anchProvider);
            const [recordsAccount] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode("recorda"),
                anchProvider.wallet.publicKey.toBuffer(),
            ], program.programId);

            const recordsAccountInfo = await connection.getAccountInfo(recordsAccount);

            setAccountExists(!!recordsAccountInfo);
            setPdaPublicKey(recordsAccount.toBase58());
        }
        catch (err) {
            console.log("Error while checking if records account exists: ", err);
        }
    };

    useEffect(() => {
        checkAccountExists();
    }, []);


    return (
        <>
            <div className="flex flex-row justify-center">
                <>

                    <div className="relative group items-center">

                        {accountExists ? (
                            <>
                                <div>
                                    Betting Records Account initialised at {pdaPublicKey}
                                </div>
                                <div style={{ margin: '20px' }}>
                                    {/* ... */}
                                </div>
                                <div style={{ padding: '20px' }}>
                                    {/* ... */}
                                </div>
                                <input
                                    placeholder="user name"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={{
                                        color: 'black', // Set the text color
                                        backgroundColor: 'white', // Set the background color
                                    }}
                                />
                                <div className="relative group items-center">

                                    <button
                                        className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                        onClick={signupUser} disabled={!ourWallet.publicKey}
                                    >
                                        <div className="hidden group-disabled:block">
                                            Wallet not connected
                                        </div>
                                        <span className="block group-disabled:hidden" >
                                            Sign Up User
                                        </span>
                                    </button>

                                </div>
                            </>

                        ) : (
                            <button
                                className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                onClick={() => {
                                    initRecords().then(() => {
                                      checkAccountExists();
                                    });
                                  }} disabled={!ourWallet.publicKey}
                            >
                                <div className="hidden group-disabled:block">
                                    Wallet not connected
                                </div>
                                <span className="block group-disabled:hidden" >
                                    Create Records Account
                                </span>
                            </button>
                        )}

                    </div>
                </>
            </div>
        </>
    );
}

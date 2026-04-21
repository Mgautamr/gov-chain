require("@nomicfoundation/hardhat-toolbox");

const { subtask } = require("hardhat/config");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require("hardhat/builtin-tasks/task-names");
const { CompilerDownloader, CompilerPlatform } = require("hardhat/internal/solidity/compiler/downloader");
const { getCompilersDir } = require("hardhat/internal/util/global-dir");

subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(
  async ({ quiet, solcVersion }, { run }) => {
    const compilersCache = await getCompilersDir();
    const downloader = CompilerDownloader.getConcurrencySafeDownloader(
      CompilerPlatform.WASM,
      compilersCache
    );

    await downloader.downloadCompiler(
      solcVersion,
      async (isCompilerDownloaded) => {
        await run("compile:solidity:log:download-compiler-start", {
          solcVersion,
          isCompilerDownloaded,
          quiet
        });
      },
      async (isCompilerDownloaded) => {
        await run("compile:solidity:log:download-compiler-end", {
          solcVersion,
          isCompilerDownloaded,
          quiet
        });
      }
    );

    return downloader.getCompiler(solcVersion);
  }
);

/** @type {import("hardhat/config").HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    tests: "./test"
  }
};

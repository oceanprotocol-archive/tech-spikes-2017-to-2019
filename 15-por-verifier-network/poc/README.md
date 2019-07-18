[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

# Install:

- Toolchain management: rustup

```
$ curl https://sh.rustup.rs -sSf | sh
$ rustup update
```

- cargo command:

```
$ cargo init
$ cargo build
$ cargo run
$ cargo test
```


# Debug:

- Search and install Rust (rls) from within VS Code
- Install LLDB
- Search and install CodeLLDB from within VS Code
- When debugging is started for the first time, you must select the environment (the debugger): select LLDB.
- When you select LLDB, a `launch.json` file will be opened, if not, open it, it's under `.vscode` folder
- create `launch.json` in the workspace:

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "lldb",
            "request": "launch",
            "name": "Debug",
            "program": "${workspaceRoot}/target/debug/${workspaceRootFolderName}",
            "args": [],
            "cwd": "${workspaceRoot}/target/debug/",
            "sourceLanguages": ["rust"]
        }
    ]
}
```
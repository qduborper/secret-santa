# Secret Santa

## Requirements
- Node.js LTS

## Get Started

1. Install dependencies:
    ```sh
    npm install
    ```

2. Copy the sample configuration file:
    ```sh
    cp config.sample.json config.json
    ```

3. Replace Twilio account information and update participants and relationships in `config.json` to avoid sending a gift to your partner or child.

4. Run the send command:
    ```sh
    node send
    ```
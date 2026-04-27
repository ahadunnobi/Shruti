# User Work

Here is the straightforward list of things you need to do to get the application fully running.

---

### 1. Set up Google Auth (in `.env.local`)
Since you are using Firebase, you can get your Google Client ID and Secret directly from the Firebase Console:
1. Go to **Authentication -> Sign-in method -> Google**.
2. Open the **Web SDK configuration** dropdown.
3. Copy the **Web client ID** and **Web client secret**.
4. Paste them into your `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=your_copied_client_id
   GOOGLE_CLIENT_SECRET=your_copied_client_secret
   ```

### 2. Add your custom Hugging Face Model URL (Optional)
If you want to use the model you fine-tuned:
1. Go to your model repository on Hugging Face.
2. Click **Deploy -> Inference Endpoints** and create a new endpoint.
3. Once the endpoint is **Running**, copy its URL.
4. Paste it into your `.env.local`:
   ```env
   CUSTOM_HF_MODEL_URL=https://your-endpoint-url.huggingface.cloud
   ```

### 3. Run Database Migrations
Make sure your Neon database is active, then run this in your terminal to create the tables:
```bash
npx prisma migrate dev --name init_and_privacy
```

### 4. Install Missing Dependencies
Install the internationalization package for English/Bengali support:
```bash
npm install next-intl
```

### 5. Start the App
You are good to go! Start the development server:
```bash
npm run dev
```

import express, { Request, Response } from "express";
import mongoose, { Schema, Document, model, Types } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";

const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());

// MongoDB connection URI
const mongoUri =
  "mongodb+srv://admin:admin@g2mdb.spmzf.mongodb.net/?retryWrites=true&w=majority&appName=g2mdb";
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Define User interface and schema for Mongoose
interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = model<IUser>("User", userSchema);

// Route: Test
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is working!" });
});

// Define typing for login request body
interface LoginBody {
  email: string;
  password: string;
}

// Route: Login
app.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id.toString() }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fallback for unsupported methods
app.use((req: Request, res: Response) => {
  res.status(405).json({ message: "Method not allowed" });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type HelloData = {
	greetings?: string;
	error?: string;
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<HelloData>
) {
	// Create a new ratelimiter, that allows 10 requests per 10 seconds
	const ratelimit = new Ratelimit({
		redis: Redis.fromEnv(),
		limiter: Ratelimit.slidingWindow(5, "10 s"),
	});
	console.log("Redis is running");

	// Use a constant string to limit all requests with a single ratelimit
	// Or use a userID, apiKey or ip address for individual limits.
	const identifier = "api";
	const { success } = await ratelimit.limit(identifier);

	if (!success) {
		console.log("Rate limit");
		res.status(406).json({ error: "Too many requests" });
	}

	res.status(200).json({ greetings: "Hello from api" });
}

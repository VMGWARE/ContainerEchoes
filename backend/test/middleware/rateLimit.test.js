const express = require("express");
const request = require("supertest");
const { expect } = require("chai");
const limiter = require("../../middleware/rateLimit");

describe("Rate Limiting Middleware", function () {
	let app;

	before(function () {
		app = express();
		app.use(limiter);
		app.get("/", (req, res) => res.status(200).send("Test route"));
	});

	it("should allow requests under the rate limit", async function () {
		for (let i = 0; i < 60; i++) {
			const response = await request(app).get("/");
			expect(response.statusCode).to.equal(200);
		}
	});

	it("should block requests over the rate limit", async function () {
		for (let i = 0; i < 120; i++) {
			await request(app).get("/");
		}
		const response = await request(app).get("/");
		expect(response.statusCode).to.equal(429);
		expect(response.body).to.deep.equal({
			status: "error",
			code: 429,
			message: "Too many requests, please try again later.",
			data: {
				retryAfter: 60,
			},
		});
	});
});

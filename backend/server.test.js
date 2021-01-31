const app = require("./server"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
const db = require("./utils/db");

describe("The Server", () => {
  beforeAll(async (done) => {
    await db.connect();
    done();
  });

  it("should be running", async (done) => {
    const res = await request.get("/");
    expect(res.status).toBe(200);
    done();
  });

  it("should register a new user", async (done) => {
    const res = await request.post("/users/register").send({
      username: "test@jest.io",
      password: "abc123456",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("username");
    done();
  });

  it("should prevent the registration of an existing user", async (done) => {
    const res = await request.post("/users/register").send({
      username: "test@jest.io",
      password: "abc123456",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    done();
  });

  it("should fail the authentication when entering wrong credentials", async (done) => {
    const res = await request.post("/users/authenticate").send({
      username: "test@jest.io",
      password: "abc1234",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    done();
  });

  it("should prevent access to protected routes", async (done) => {
    const res = await request.get("/users/self");
    expect(res.status).toBe(401);
    done();
  });

  var authToken = "";
  it("should authenticate a user", async (done) => {
    const res = await request.post("/users/authenticate").send({
      username: "test@jest.io",
      password: "abc123456",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    authToken = res.body.token;
    done();
  });

  it("should return the user profile", async (done) => {
    const res = await request.get("/users/self").set("Authorization", "bearer " + authToken);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("username");
    done();
  });

  it("should add an SQL answer", async (done) => {
    const res = await request
      .patch("/users/self/answer_sql")
      .set("Authorization", "bearer " + authToken)
      .send({
        task: "task-001",
        query: "SELECT * FROM LOREM",
        correct: true,
      });
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.history).length).toBe(1);
    done();
  });

  afterAll(async (done) => {
    await db.get().collection("users").remove({ username: "test@jest.io" });
    await db.close();
    done();
  });
});

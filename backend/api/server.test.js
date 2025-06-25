const app = require("./server"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
const db = require("./utils/db");

describe("The Server", () => {
  const USERNAME = "test@jest.io";

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
      username: USERNAME,
      password: "abc123456",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("username");
    done();
  });

  it("should prevent the registration of an existing user", async (done) => {
    const res = await request.post("/users/register").send({
      username: USERNAME,
      password: "abc123456",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    done();
  });

  it("should fail the authentication when entering wrong credentials", async (done) => {
    const res = await request.post("/users/authenticate").send({
      username: USERNAME,
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

  it("should respond to wrong parameters", async (done) => {
    const res = await request.post("/users/authenticate").send({
      username: USERNAME,
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    done();
  });

  var authToken = "";
  it("should authenticate a user", async (done) => {
    const res = await request.post("/users/authenticate").send({
      username: USERNAME,
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

  var resetPasswordToken = "";
  it("should recover the password", async (done) => {
    const res = await request.post("/users/recover").send({
      username: USERNAME,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    const user = await db.get().collection("users").findOne({ username: USERNAME });
    expect(user).toHaveProperty("resetPasswordToken");
    expect(user).toHaveProperty("resetPasswordExpires");
    resetPasswordToken = user.resetPasswordToken;
    done();
  });

  it("should reset the password", async (done) => {
    const NEW_PASSWORD = "1234567";
    var res = await request.post("/users/reset").send({
      token: resetPasswordToken,
      password: NEW_PASSWORD,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    res = await request.post("/users/authenticate").send({
      username: USERNAME,
      password: NEW_PASSWORD,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    done();
  });

  afterAll(async (done) => {
    await db.get().collection("users").deleteOne({ username: USERNAME });
    await db.close();
    done();
  });
});

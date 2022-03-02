const request = require('supertest');
const app = require("../../app");
const {mongoConnect,
        mongoDisconnect} = require("../../services/mongo")

describe('Launches API',()=>{
    beforeAll(async()=>{
        await mongoConnect()
    })

    afterAll(async()=>{
        await mongoDisconnect()
    })

    describe('Test GET/launches',()=>{
        test('200 success',async ()=>{
            const response = await request(app).get('/launch').expect(200)
        })
    })

    describe('Test POST/launches',()=>{
        const launchDataWithoutDate = {
            mission:"abc111",
            rocket:"GO",
            destination:"Kepler-1652 b",
        };

        const completeLaunchdate = {
            mission:"abc111",
            rocket:"GO",
            destination:"Kepler-1652 b",
            launchDate:"January 18, 2030"
        };

        const launchDataWithInvalidDate = {
            mission:"a",
            rocket:"b",
            destination:"c",
            launchDate:"a"
        }

        test('201 success', async ()=>{
            const response = await request(app)
                .post('/v1/launch')
                .send(completeLaunchdate)
                .expect(201)
                .expect('Content-Type',/json/);

            const requestDate = new Date(completeLaunchdate.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(requestDate).toBe(responseDate)
            expect(response.body).toMatchObject(launchDataWithoutDate)
        })

        test("catch missing properties", async()=>{
            const response = await request(app)
                .post('/v1/launch')
                .send(launchDataWithoutDate)
                .expect(400)
                .expect('Content-Type',/json/);
            expect(response.body).toStrictEqual({
                error:'Missing required launch property'
            })

        })
        test("catch invalid dates", async()=>{
            const response = await request(app)
                .post('/v1/launch')
                .send(launchDataWithInvalidDate)
                .expect(400)
                .expect('Content-Type',/json/);
            expect(response.body).toStrictEqual({
                error:'Invalid date'
            })
        })
    })
})
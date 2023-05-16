import request from 'supertest';
import app from '../../app';
import { UserService } from '../../services/user.service';
import { EsiProfileService } from '../../services/esiprofile.service';
import { Account } from '../../interfaces/Account';
import { EsiProfile } from '../../database/schema';
import axios from "axios";
import { EVEApiCharacterProfile } from '../../interfaces/EVEApiCharacterProfile';
import { EVEApiPortraitUrls } from '../../interfaces/EVEApiPortraitUrls';

const user = {
  id: 1,
  name: 'test',
  mainCharacterId: 123,
  registered: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const esiProfile = {
  characterId: 123,
  characterName: 'test',
  accessToken: 'test',
  refreshToken: 'test',
  expiresOn: 'test',
  userId: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const authenticatedSession = {
  passport: {
    user: {
      user,
      esiProfiles: [esiProfile as EsiProfile],
    } satisfies Account
  }
};

jest.mock("axios");
jest.mock('../../middlewares/authProtectedRoute', () => jest.fn((req, _res, next) => {
  if (req.cookies && req.cookies['eve-equinox-session']) {
    try {
      req.session.passport = JSON.parse(req.cookies['eve-equinox-session']);
    } catch (error) {
      console.error('error: ', error);
    }
  }
  next();
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Profile API Endpoints', () => {
  beforeAll(async () => {
    //populate dummy data
    await UserService.insertOrUpdate(user);
    await EsiProfileService.insertOrUpdate(esiProfile);
  });
  afterAll(async () => {
    //clean up the database
    UserService.deleteAll();
    EsiProfileService.deleteAll();
  });

  describe('GET /profile', () => {
    beforeEach(() => {
      mockedAxios.get.mockImplementationOnce(() => Promise.resolve({
        data: {
          birthday: "2016-09-03T11:05:00Z",
          bloodline_id: 1,
          corporation_id: 109299958,
          description: "A description",
          gender: 'male',
          name: 'test',
          race_id: 1,
          title: 'A title'
        } satisfies EVEApiCharacterProfile
      }));

      mockedAxios.get.mockImplementationOnce(() => Promise.resolve({
        data: {
          px128x128: "https://images.evetech.net/characters/123/portrait?tenant=tranquility&size=128",
          px256x256: "https://images.evetech.net/characters/123/portrait?tenant=tranquility&size=256",
          px512x512: "https://images.evetech.net/characters/123/portrait?tenant=tranquility&size=512",
          px64x64: "https://images.evetech.net/characters/123/portrait?tenant=tranquility&size=64"
        } satisfies EVEApiPortraitUrls
      }));
    });

    it('should returns 200 and data', async () => {

      const result = await request(app)
        .get('/profile')
        .set('Cookie', [`eve-equinox-session=${JSON.stringify(authenticatedSession.passport)}`])


      expect(result.statusCode).toEqual(200);
      expect(result.body.characterProfiles).toBeTruthy();
      expect(result.body.characterProfiles[0].id).toBe(123);
    });

    it('should returns 401 when not authenticated', async () => {
      const result = await request(app)
        .get('/profile');

      expect(result.statusCode).toEqual(401);
      expect(result.body.message).toBeTruthy();
    });

    it('should returns 401 when no esiProfile', async () => {
      const result = await request(app)
        .get('/profile')
        .set('Cookie', [`eve-equinox-session=${JSON.stringify({ user: { user } })}`])

      expect(result.statusCode).toEqual(401);
      expect(result.body.message).toBeTruthy();
    });

    it('should returns 401 when no mainCharacterId', async () => {
      const result = await request(app)
        .get('/profile')
        .set('Cookie', [`eve-equinox-session=${JSON.stringify({
          user: {
            user: {
              ...user,
              mainCharacterId: undefined
            }, esiProfiles: [esiProfile]
          }
        })}`])

      expect(result.statusCode).toEqual(401);
      expect(result.body.message).toBeTruthy();
    });
  });
});
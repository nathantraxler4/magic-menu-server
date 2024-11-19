import '../../src/setup/config';
import { describe, test, expect, jest } from '@jest/globals';
import * as menuService from '../../src/services/menuService';
import openai from '../../src/setup/openai';
import { recipes } from '../mocks/recipes';
import { beforeEach } from 'node:test';

// Mock the OpenAI client
jest.mock('../../src/setup/openai', () => {
    return {
        __esModule: true,
        default: {
            chat: {
                completions: {
                    create: jest.fn(() => Promise.resolve())
                }
            }
        }
    };
});

const mockCreate = openai.chat.completions.create as jest.Mock;

describe('generateMenu', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('WHEN calling generate recipe with one recipe', () => {
        test('THEN a menu object is returned', async () => {
            mockCreate.mockImplementation(() =>
                Promise.resolve({
                    choices: [{ message: { content: '["some description1"]' } }]
                })
            );

            const menu = await menuService.generateMenu([recipes[0]]);

            expect(menu).toMatchObject({
                backgroundImage: 1,
                courses: [{ description: 'some description1', name: 'name1' }]
            });
            expect(mockCreate).toHaveBeenCalled();
        });
    });

    describe('WHEN calling generate recipe with 3 recipes and LLM only response with 1 description.', () => {
        test('THEN an error is thrown', async () => {
            mockCreate.mockImplementation(() =>
                Promise.resolve({
                    choices: [{ message: { content: '["some description1"]' } }]
                })
            );
            await expect(() => menuService.generateMenu(recipes)).rejects.toThrow(
                'LLM did not respond with appropriate number of recipe descriptions.'
            );
            expect(mockCreate).toHaveBeenCalled();
        });
    });

    describe('WHEN calling generate recipe with 3 recipes and LLM responds with 3 descriptions.', () => {
        test('THEN an error is thrown', async () => {
            mockCreate.mockImplementation(() =>
                Promise.resolve({
                    choices: [
                        {
                            message: {
                                content:
                                    '["some description1", "some description2", "some description3"]'
                            }
                        }
                    ]
                })
            );
            const menu = await menuService.generateMenu(recipes);

            expect(menu).toMatchObject({
                backgroundImage: 1,
                courses: [
                    { description: 'some description1', name: 'name1' },
                    { description: 'some description2', name: 'name2' },
                    { description: 'some description3', name: 'name3' }
                ]
            });
            expect(mockCreate).toHaveBeenCalled();
        });
    });

    describe('WHEN the recipe input is empty', () => {
        test('THEN an empty menu is returned', async () => {
            mockCreate.mockImplementation(() =>
                Promise.resolve({
                    choices: [
                        {
                            message: {
                                content: '[]'
                            }
                        }
                    ]
                })
            );

            const menu = await menuService.generateMenu([]);

            expect(menu).toMatchObject({
                courses: [],
                backgroundImage: 1
            });

            expect(mockCreate).toHaveBeenCalled();
        });
    });

    describe('WHEN the LLM responds with malformed JSON', () => {
        test('THEN an LLM_RESPONSE_PARSE_ERROR is thrown', async () => {
            mockCreate.mockImplementation(() =>
                Promise.resolve({
                    choices: [
                        {
                            message: {
                                content: 'Not a JSON string'
                            }
                        }
                    ]
                })
            );

            await expect(menuService.generateMenu(recipes)).rejects.toThrow(
                'Content does not contain a valid JSON array. Content received: "Not a JSON string"'
            );

            expect(mockCreate).toHaveBeenCalled();
        });
    });

    describe('WHEN the LLM responds with array that is not valid JSON', () => {
        test('THEN an LLM_RESPONSE_PARSE_ERROR is thrown', async () => {
            mockCreate.mockImplementation(() =>
                Promise.resolve({
                    choices: [
                        {
                            message: {
                                content: '[this is not json]'
                            }
                        }
                    ]
                })
            );

            await expect(menuService.generateMenu(recipes)).rejects.toThrow(
                'Failed to parse LLM Response as JSON. Content received: "[this is not json]"'
            );

            expect(mockCreate).toHaveBeenCalled();
        });
    });

    describe('WHEN the chat completion does not have content', () => {
        test('THEN an LLM_RESPONSE_PARSE_ERROR is thrown', async () => {
            mockCreate.mockImplementation(() =>
                Promise.resolve({
                    choices: [
                        {
                            message: {}
                        }
                    ]
                })
            );

            await expect(menuService.generateMenu(recipes)).rejects.toThrow(
                'LLM response has not content.'
            );

            expect(mockCreate).toHaveBeenCalled();
        });
    });

    describe('WHEN the LLM API request fails', () => {
        test('THEN an LLM_API_ERROR is thrown', async () => {
            mockCreate.mockImplementation(() => Promise.reject(new Error('API Error')));

            await expect(menuService.generateMenu(recipes)).rejects.toThrow(
                'An error occurred requesting LLM API.'
            );

            expect(mockCreate).toHaveBeenCalled();
        });
    });
});

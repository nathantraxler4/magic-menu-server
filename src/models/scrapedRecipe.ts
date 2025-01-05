import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';

// Sub-models for nested objects
class ImageObject {
    @prop()
    url?: string;

    @prop()
    height?: number;

    @prop()
    width?: number;
}

class Publisher {
    @prop({ required: true })
    name!: string;

    @prop()
    url?: string;

    @prop()
    brand?: string;

    @prop()
    publishingPrinciples?: string;

    @prop({ type: () => [String] })
    sameAs?: string[];
}

class AggregateRating {
    @prop()
    ratingValue?: string;

    @prop()
    ratingCount?: string;
}

class NutritionInformation {
    @prop()
    calories?: string;

    @prop()
    carbohydrateContent?: string;

    @prop()
    cholesterolContent?: string;

    @prop()
    fiberContent?: string;

    @prop()
    proteinContent?: string;

    @prop()
    saturatedFatContent?: string;

    @prop()
    sodiumContent?: string;

    @prop()
    sugarContent?: string;

    @prop()
    fatContent?: string;

    @prop()
    unsaturatedFatContent?: string;
}

class HowToStep {
    @prop({ required: true })
    text!: string;
}

// Main Recipe Model
@modelOptions({ schemaOptions: { collection: 'ScrapedRecipes' } })
class ScrapedRecipe {
    @prop({ required: true })
    headline!: string;

    @prop()
    datePublished?: string;

    @prop()
    dateModified?: string;

    @prop()
    description?: string;

    @prop({ type: () => ImageObject })
    image?: ImageObject;

    @prop({ type: () => Publisher })
    publisher?: Publisher;

    @prop({ required: true })
    name!: string;

    @prop()
    url!: string;

    @prop({ type: () => [String] })
    recipeIngredient!: string[];

    @prop({ type: () => [HowToStep] })
    recipeInstructions!: HowToStep[];

    @prop({ type: () => AggregateRating })
    aggregateRating?: AggregateRating;

    @prop()
    cookTime?: string;

    @prop({ type: () => NutritionInformation })
    nutrition?: NutritionInformation;

    @prop()
    prepTime?: string;

    @prop({ type: () => [String] })
    recipeCategory?: string[];

    @prop({ type: () => [String] })
    recipeCuisine?: string[];

    @prop({ type: () => [String] })
    recipeYield?: string[];

    @prop()
    totalTime?: string;
}

// Create the model
const ScrapedRecipeModel = getModelForClass(ScrapedRecipe);

// Export the model
export default ScrapedRecipeModel;

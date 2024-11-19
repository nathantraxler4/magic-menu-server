import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({
    schemaOptions: { timestamps: true },
    options: { customName: 'Menu' }
})
class CourseClass {
    @prop({ required: true })
    name!: string;

    @prop()
    description!: string;
}

@modelOptions({
    schemaOptions: { timestamps: true },
    options: { customName: 'Menu' }
})
class MenuClass {
    @prop({ required: true })
    backgroundImage!: string;

    @prop()
    courses!: CourseClass[];
}

const MenuModel = getModelForClass(MenuClass);

export default MenuModel;

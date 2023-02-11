import fs from "fs";
import {PathToClone, PathToParse} from "../Static/fileds";
import { ILines, ItemRecipes } from "../itemSchemas";
import { IndexDirName } from "../index";

export const ParseBarterRecipes = async function ParseBarterRecipes(PathToListing: string): Promise<void> {
    const ListingJson = JSON.parse(fs.readFileSync(PathToListing).toString());
    const Recipes = JSON.parse(fs.readFileSync(IndexDirName+'\\'+PathToClone+'\\'+`ru`+'\\'+'barter_recipes.json').toString());
    const ParsedItemRecipes: ItemRecipes[] = [];

    if (Recipes) {
        Recipes.forEach((settlement: any) => {
            const SettlementName: ILines = settlement.settlementTitle.lines;
            settlement.recipes.forEach((recipe: any) => {
                const Item: ItemRecipes = new ItemRecipes({
                    exbo_id: recipe.item,
                    settlementTitles: [
                        SettlementName
                    ],
                    settlementRequiredLevel: recipe.settlementRequiredLevel,
                    recipes: []
                });

                const ThisItemExists: ItemRecipes[] = ParsedItemRecipes.filter(item => item.exbo_id == recipe.item);
                if (ThisItemExists.length > 0) {
                    const index = ParsedItemRecipes.indexOf(ThisItemExists[0]);
                    if (ParsedItemRecipes[index].settlementTitles.filter(lines => lines.en == SettlementName.en).length == 0) {
                        ParsedItemRecipes[index].settlementTitles.push(SettlementName);
                    }
                } else {
                    recipe.offers.forEach((offer: any) => {
                        const MainItemID = offer.requiredItems.length > 0 && offer.requiredItems[0].amount == 1 ? offer.requiredItems[0].item : null;
                        let mainItem = null;
                        let canPushItem = true;
                        if (MainItemID) {
                            const ItemFromListing = ListingJson.filter((item: any) => item.exbo_id == MainItemID)[0];
                            if (ItemFromListing != undefined) {
                                mainItem = {
                                    exbo_id: ItemFromListing.exbo_id,
                                    category: ItemFromListing.category,
                                    lines: ItemFromListing.name,
                                }
                            } else {
                                // Предложение бартера Улья, где требуется странный ящик, пока не будет этого рецепта :)
                                canPushItem = false
                            }
                        }

                        let otherItemsFromListing = offer.requiredItems.filter((item: any) => item.amount > 1);
                        ListingJson.forEach((item: any) => {
                            if (typeof item[0] != 'object')
                            otherItemsFromListing = otherItemsFromListing.map((otherItem: any) => {
                                if (otherItem.item != undefined && item.exbo_id == otherItem.item) {
                                    otherItem = {
                                        exbo_id: item.exbo_id,
                                        category: item.category,
                                        lines: item.name,
                                        amount: otherItem.amount
                                    }
                                }
                                return otherItem;
                            });
                        });

                        if (canPushItem) {
                            Item.recipes.push({
                                money: offer.cost.toString(),
                                item: mainItem,
                                otherItems: otherItemsFromListing
                            });
                        }
                    });

                    ParsedItemRecipes.push(Item);
                }
            });
        });

        const PathToResultFolder = IndexDirName+'\\'+PathToParse+'\\'+'recipes'+'\\';
        if (!fs.existsSync(PathToResultFolder)) {
            fs.mkdirSync(PathToResultFolder);
        }

        ParsedItemRecipes.forEach(item => {
            fs.writeFileSync(PathToResultFolder+`${item.exbo_id}.json`, JSON.stringify(item));
        });
    } else {
        throw new Error('Error when parse barter recipes!');
    }
}
import { it, describe, beforeAll, afterAll, expect } from "vitest";
import { TEST_ACCESS_TOKEN, TEST_HUB_URL, TEST_USER } from "../test/consts";
import { updateCollectionItem } from "./update-collection-item";
import { insecureRandomString } from "../utils/insecureRandomString";
import { listCollections } from "./list-collections";
import { deleteCollection } from "./delete-collection";
import { createCollection } from "./create-collection";
import type { CollectionItemType } from "../types/api/api-collection";
import { addCollectionItem } from "./add-collection-item";
import { getCollection } from "./get-collection";
// import { type Collection } from "../types/api/api-collection";
// import { type CollectionEntry, getCollection } from "./get-collections";

describe("updateCollectionItem", () => {
	const credentials = {
		accessToken: TEST_ACCESS_TOKEN,
	};
	const hubUrl = TEST_HUB_URL;
	const title = "This is a new test collection " + insecureRandomString();
	const description = "Test collection";
	const namespace = TEST_USER;

	const cleanUp = async () => {
		const list = listCollections({
			search: {
				q: title,
			},
			credentials,
			hubUrl,
		});
		for await (const item of list) {
			await deleteCollection({
				slug: item.slug,
				missing_ok: true,
				credentials,
				hubUrl,
			});
		}
	};

	beforeAll(cleanUp);
	afterAll(cleanUp);

	it("should update a collection item", async () => {
		const col = await createCollection({
			title,
			description,
			namespace,
			private: false,
			exists_ok: false,
			credentials,
			hubUrl,
		});

		const item = { id: "hub.js/TEST-fa82dodtqee", type: "model" as CollectionItemType };

		const colItem = await addCollectionItem({
			collection_slug: col.slug,
			item: item,
			note: "note added",
			exists_ok: false,
			credentials,
			hubUrl,
		});

		await updateCollectionItem({
			collection_slug: col.slug,
			item_object_id: colItem.items[0]._id,
			position: 100,
			note: "updated note",
			credentials,
			hubUrl,
		});

		const updCol = await getCollection({
			slug: col.slug,
			credentials,
			hubUrl,
		});

		expect(updCol.items?.[0]).toMatchObject({
			...item,
			note: { text: "updated note" },
			position: 100,
		});
	});
});

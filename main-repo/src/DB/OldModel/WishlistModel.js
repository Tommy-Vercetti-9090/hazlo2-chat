import { Schema, model } from 'mongoose'

const WishlistSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    auth: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
  },
  {
    timestamps,
  },
)

const WishlistModel = model('Wishlist', WishlistSchema)

export default WishlistModel

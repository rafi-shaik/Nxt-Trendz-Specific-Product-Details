// Write your code here
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import {Link} from 'react-router-dom'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'

import {Component} from 'react'
import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  progress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class ProductItemDetails extends Component {
  state = {productDetails: {}, count: 1, apiStatus: apiStatusConstants.initial}

  componentDidMount() {
    this.getProductDetails()
  }

  getFormattedDetails = obj => ({
    id: obj.id,
    imageUrl: obj.image_url,
    title: obj.title,
    style: obj.style,
    price: obj.price,
    description: obj.description,
    brand: obj.brand,
    totalReviews: obj.total_reviews,
    rating: obj.rating,
    availability: obj.availability,
  })

  getProductDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.progress})

    const {match} = this.props
    const {params} = match
    const {id} = params

    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()
    if (response.ok) {
      const modifiedData = {
        id: data.id,
        price: data.price,
        description: data.description,
        imageUrl: data.image_url,
        title: data.title,
        brand: data.brand,
        totalReviews: data.total_reviews,
        rating: data.rating,
        availability: data.availability,
        similarProducts: data.similar_products.map(each =>
          this.getFormattedDetails(each),
        ),
      }

      this.setState({
        apiStatus: apiStatusConstants.success,
        productDetails: modifiedData,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  renderLoader = () => (
    <div data-testid="loader" className="product-details-loader-container">
      <Loader type="ThreeDots" color="#0b69ff" height={80} width={80} />
    </div>
  )

  renderFailureView = () => (
    <div className="product-details-failure-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
        className="failure-view-image"
      />
      <h1 className="product-not-found-heading">Product Not Found</h1>
      <Link to="/products">
        <button className="button" type="button">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  decreaseCount = () => {
    const {count} = this.state
    if (count > 1) {
      this.setState(prevState => ({count: prevState.count - 1}))
    }
  }

  increaseCount = () => {
    this.setState(prevState => ({count: prevState.count + 1}))
  }

  renderProducts = () => {
    const {productDetails, count} = this.state
    const {
      totalReviews,
      price,
      description,
      imageUrl,
      title,
      brand,
      rating,
      availability,
      similarProducts,
    } = productDetails

    return (
      <div className="product-details-success-view">
        <div className="product-details-container">
          <img src={imageUrl} alt="product" className="product-image" />
          <div className="product">
            <h1 className="product-name">{title}</h1>
            <p className="price-details">Rs {price}/- </p>
            <div className="rating-and-reviews-count">
              <div className="rating-container">
                <p className="rating">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                  className="star"
                />
              </div>
              <p className="reviews-count">{totalReviews} Reviews</p>
            </div>
            <p className="product-description">{description}</p>
            <p className="availability">
              <span className="span-element">Available: </span>
              {availability}
            </p>
            <p className="availability">
              <span className="span-element">Brand: </span>
              {brand}
            </p>
            <hr />
            <div className="quantity-container">
              <button
                type="button"
                className="quantity-controller-button"
                onClick={this.decreaseCount}
                data-testid="minus"
              >
                <BsDashSquare className="quantity-controller-icon" />
              </button>
              <p className="quantity">{count}</p>
              <button
                type="button"
                className="quantity-controller-button"
                onClick={this.increaseCount}
                data-testid="plus"
              >
                <BsPlusSquare className="quantity-controller-icon" />
              </button>
            </div>
            <button type="button" className="button add-to-cart-btn">
              ADD TO CART
            </button>
          </div>
        </div>
        <h1 className="similar-products-heading">Similar Products</h1>
        <ul className="similar-products-list">
          {similarProducts.map(each => (
            <SimilarProductItem key={each.id} details={each} />
          ))}
        </ul>
      </div>
    )
  }

  renderViews = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProducts()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.progress:
        return this.renderLoader()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="product-item-details-container">
          {this.renderViews()}
        </div>
      </>
    )
  }
}

export default ProductItemDetails

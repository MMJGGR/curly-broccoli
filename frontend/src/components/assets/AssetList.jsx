import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit, Trash2, TrendingUp, TrendingDown, MapPin, Calendar, DollarSign } from '../ui/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AssetList = ({ assets, onEditAsset, onDeleteAsset }) => {
  const [sortBy, setSortBy] = useState('current_value');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');

  // const handleSort = (field) => {
  //   if (sortBy === field) {
  //     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  //   } else {
  //     setSortBy(field);
  //     setSortOrder('desc');
  //   }
  // };

  const getAssetCategories = () => {
    const categories = ['all', ...new Set(assets.map(asset => asset.asset_category))];
    return categories;
  };

  const getFilteredAndSortedAssets = () => {
    let filtered = assets;
    
    if (filterCategory !== 'all') {
      filtered = assets.filter(asset => asset.asset_category === filterCategory);
    }

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'current_value':
          aValue = a.current_value;
          bValue = b.current_value;
          break;
        case 'unrealized_gain_loss':
          aValue = a.unrealized_gain_loss;
          bValue = b.unrealized_gain_loss;
          break;
        case 'gain_loss_percentage':
          aValue = a.gain_loss_percentage;
          bValue = b.gain_loss_percentage;
          break;
        case 'acquisition_date':
          aValue = new Date(a.acquisition_date);
          bValue = new Date(b.acquisition_date);
          break;
        default:
          aValue = a.current_value;
          bValue = b.current_value;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'current_assets': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'investment_assets': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'fixed_assets': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'intangible_assets': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAssets = getFilteredAndSortedAssets();

  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets yet</h3>
            <p className="text-gray-600 mb-4">
              Start building your portfolio by adding your first asset
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <CardTitle>Your Assets ({filteredAssets.length})</CardTitle>
          
          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getAssetCategories().map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : 
                   category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="current_value-desc">Highest Value</option>
              <option value="current_value-asc">Lowest Value</option>
              <option value="unrealized_gain_loss-desc">Highest Gain</option>
              <option value="unrealized_gain_loss-asc">Highest Loss</option>
              <option value="gain_loss_percentage-desc">Best Performance</option>
              <option value="gain_loss_percentage-asc">Worst Performance</option>
              <option value="name-asc">Name A-Z</option>
              <option value="acquisition_date-desc">Newest First</option>
              <option value="acquisition_date-asc">Oldest First</option>
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                {/* Asset Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <Badge 
                        variant="outline" 
                        className={getCategoryColor(asset.asset_category)}
                      >
                        {asset.asset_category.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={getRiskLevelColor(asset.risk_level)}
                      >
                        {asset.risk_level.toUpperCase()}
                      </Badge>
                      {asset.is_liquid && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          LIQUID
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    {/* Current Value */}
                    <div>
                      <p className="text-gray-600">Current Value</p>
                      <p className="font-semibold text-lg">
                        {formatCurrency(asset.current_value)}
                      </p>
                    </div>

                    {/* Gain/Loss */}
                    <div>
                      <p className="text-gray-600">Gain/Loss</p>
                      <div className="flex items-center space-x-1">
                        {asset.unrealized_gain_loss >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`font-semibold ${
                          asset.unrealized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(asset.unrealized_gain_loss)}
                        </span>
                        <span className={`text-sm ${
                          asset.unrealized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ({asset.gain_loss_percentage > 0 ? '+' : ''}{asset.gain_loss_percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    {/* Acquisition Info */}
                    <div>
                      <p className="text-gray-600">Acquired</p>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{formatDate(asset.acquisition_date)}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Cost: {formatCurrency(asset.acquisition_cost)}
                      </p>
                    </div>

                    {/* Location */}
                    <div>
                      <p className="text-gray-600">Details</p>
                      {asset.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{asset.location}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 capitalize">
                        {asset.asset_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {asset.description && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{asset.description}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 lg:ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAsset(asset)}
                    className="flex items-center space-x-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteAsset(asset.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetList;